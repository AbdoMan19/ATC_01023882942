import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event, EventCategory } from '../../../core/models/event.model';
import { Observable, switchMap, filter, of } from 'rxjs';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  loading = false;
  error: string | null = null;
  isEditMode = false;
  event$: Observable<Event>;
  categories = Object.values(EventCategory);
  isFormUpdated = false;

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private eventService: EventService
  ) {
    this.initializeForm();

    this.isEditMode = this.route.snapshot.params['id'] !== undefined;
    if (this.isEditMode) {
      this.event$ = this.route.paramMap.pipe(
        switchMap(params => {
          const id = params.get('id');
          if (!id) {
            this.router.navigate(['/admin/events']);
            return of(null);
          }
          return this.eventService.getEventById(id);
        }),
        filter((event): event is Event => event !== null)
      );

      this.event$.subscribe(event => {
        const [startDate, startTime] = new Date(event.startDate).toISOString().split('T');
        const [endDate, endTime] = new Date(event.endDate).toISOString().split('T');
        
        this.eventForm.patchValue({
          ...event,
          startDate,
          startTime: startTime.substring(0, 5),
          endDate,
          endTime: endTime.substring(0, 5),
        });
        
        if (event.gallery && event.gallery.length > 0) {
          while (this.galleryControls.length > 0) {
            this.galleryControls.removeAt(0);
          }
          
          event.gallery.forEach(imageUrl => {
            const control = this.formBuilder.control(imageUrl, [Validators.required, Validators.pattern('https?://.*')]);
            this.galleryControls.push(control);
          });
        }
        this.isFormUpdated = false;
      });
    }
  }

  ngOnInit(): void {}

  initializeForm(): void {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      availableSeats: ['', [Validators.required, Validators.min(1)]],
      totalSeats: ['', [Validators.required, Validators.min(1)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.*')]],
      gallery: this.formBuilder.array([])
    });
    
    // Set initial form state
    this.isFormUpdated = false;
    
    // Track form changes
    this.eventForm.valueChanges.subscribe(() => {
      // Validate form
      this.validateDateRange();
      this.validateSeats();
      
      // Mark the form as updated when any changes are made
      if (!this.isFormUpdated) {
        this.isFormUpdated = true;
      }
    });
  }
  
  validateDateRange(): void {
    if (!this.eventForm) return;

    const startDate = this.eventForm.get('startDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;
    const startTime = this.eventForm.get('startTime')?.value;
    const endTime = this.eventForm.get('endTime')?.value;
    
    // Clear previous errors first
    this.eventForm.get('endDate')?.setErrors(null);
    this.eventForm.get('endTime')?.setErrors(null);
    
    // Only validate if all date/time fields have values
    if (startDate && endDate && startTime && endTime) {
      try {
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        
        if (start >= end) {
          this.eventForm.get('endDate')?.setErrors({ invalidDateRange: true });
          this.eventForm.get('endTime')?.setErrors({ invalidDateRange: true });
        }
      } catch (error) {
        // Handle any potential date parsing errors
        console.error('Date validation error:', error);
      }
    }
  }

  validateSeats(): void {
    if (!this.eventForm) return;

    const availableSeats = this.eventForm.get('availableSeats')?.value;
    const totalSeats = this.eventForm.get('totalSeats')?.value;
    console.log(availableSeats , totalSeats)
    if (availableSeats && totalSeats) {
      if (Number(availableSeats) > Number(totalSeats)) {
        console.log("error error");
        this.eventForm.get('availableSeats')?.setErrors({ exceedsTotalSeats: true });
      }
    }
  }

  onSubmit(): void {
    // Don't submit if the button should be disabled
    if (this.eventForm.invalid || this.loading || !this.isFormUpdated) {
      console.log("Form submission blocked: ", {
        isInvalid: this.eventForm.invalid,
        isLoading: this.loading,
        notUpdated: !this.isFormUpdated
      });
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    try {
      const formValue = this.eventForm.value;
      const galleryImages = this.galleryControls.controls.map(control => control.value);
      
      const eventData = {
        ...formValue,
        startDate: new Date(`${formValue.startDate}T${formValue.startTime}`).toISOString(),
        endDate: new Date(`${formValue.endDate}T${formValue.endTime}`).toISOString(),
        gallery: galleryImages
      };

      // Remove individual date/time fields that aren't part of the Event model
      delete eventData.startTime;
      delete eventData.endTime;

      const request$ = this.isEditMode
        ? this.eventService.updateEvent(this.route.snapshot.params['id'], eventData)
        : this.eventService.createEvent(eventData);

      request$.subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/events']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    } catch (error) {
      this.error = (error as Error).message;
      this.loading = false;
      console.error("Error during form submission:", error);
    }
  }

  // Debug function to test form submission regardless of validation
  submitAnyway(): void {
    console.log("Forced submission attempt");
    
    try {
      const formValue = this.eventForm.value;
      const galleryImages = this.galleryControls.controls.map(control => control.value);
      
      this.loading = true;
      this.error = null;
      
      const eventData = {
        ...formValue,
        startDate: new Date(`${formValue.startDate || '2023-01-01'}T${formValue.startTime || '12:00'}`).toISOString(),
        endDate: new Date(`${formValue.endDate || '2023-01-02'}T${formValue.endTime || '12:00'}`).toISOString(),
        gallery: galleryImages
      };

      // Remove individual date/time fields that aren't part of the Event model
      delete eventData.startTime;
      delete eventData.endTime;

      console.log("Event data for submission:", eventData);
      
      const request$ = this.isEditMode
        ? this.eventService.updateEvent(this.route.snapshot.params['id'], eventData)
        : this.eventService.createEvent(eventData);

      request$.subscribe({
        next: () => {
          this.loading = false;
          console.log("Submission successful");
          this.router.navigate(['/admin/events']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.log("Submission error:", error);
        }
      });
    } catch (error) {
      console.error("Error during form preparation:", error);
      this.loading = false;
      this.error = "Error preparing form data: " + (error as Error).message;
    }
  }

  // Helper method to get all form validation errors
  getFormValidationErrors(): {[key: string]: any} {
    const errorObj: {[key: string]: any} = {};
    
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      if (control && control.errors) {
        errorObj[key] = control.errors;
      }
    });
    
    return errorObj;
  }

  getErrorMessage(controlName: string): string {
    const control = this.eventForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (controlName === 'title' && control?.hasError('minlength')) {
      return 'Title must be at least 3 characters';
    }
    if (controlName === 'description' && control?.hasError('minlength')) {
      return 'Description must be at least 10 characters';
    }
    if (controlName === 'price' && control?.hasError('min')) {
      return 'Price must be greater than 0';
    }
    if (controlName === 'availableSeats' && control?.hasError('min')) {
      return 'Available seats must be at least 1';
    }
    if (controlName === 'totalSeats' && control?.hasError('min')) {
      return 'Total seats must be at least 1';
    }
    if (controlName === 'imageUrl' && control?.hasError('pattern')) {
      return 'Please enter a valid URL';
    }
    if ((controlName === 'endDate' || controlName === 'endTime') && 
        control?.hasError('invalidDateRange')) {
      return 'End date/time must be after start date/time';
    }
    if (controlName === 'availableSeats' && control?.hasError('exceedsTotalSeats')) {
      return 'Available seats cannot exceed total seats';
    }
    return '';
  }
  
  // Get error message for gallery control
  getGalleryErrorMessage(index: number): string {
    const control = this.galleryControls.at(index);
    if (control.hasError('required')) {
      return 'URL is required';
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid URL (must start with http:// or https://)';
    }
    return '';
  }

  // Type-safe form control accessor methods
  getFormControl(controlName: string): FormControl {
    return this.eventForm.get(controlName) as FormControl;
  }

  // Gallery form array accessor
  get galleryControls(): FormArray {
    return this.eventForm.get('gallery') as FormArray;
  }

  // Add a new gallery image field
  addGalleryImage() {
    const urlPattern = 'https?://.*';
    const control = this.formBuilder.control('', [Validators.required, Validators.pattern(urlPattern)]);
    this.galleryControls.push(control);
    this.isFormUpdated = true; // Mark form as updated
  }

  // Remove a gallery image field
  removeGalleryImage(index: number) {
    this.galleryControls.removeAt(index);
    this.isFormUpdated = true; // Mark form as updated
  }
}