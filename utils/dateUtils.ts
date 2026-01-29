// Shared date utility functions to handle Firestore timestamps and invalid dates

export const formatDate = (dateInput: string | Date | any): string => {
  try {
    let date: Date;
    
    if (!dateInput) {
      return 'No date';
    }
    
    if (typeof dateInput === 'string') {
      // Handle Firestore timestamp format: seconds_nanoseconds
      if (dateInput.includes('_') && /^\d+_\d+$/.test(dateInput)) {
        const [seconds, nanoseconds] = dateInput.split('_');
        date = new Date(parseInt(seconds) * 1000 + parseInt(nanoseconds) / 1000000);
      } else {
        // Regular string date
        date = new Date(dateInput);
      }
    } else if (dateInput && typeof dateInput === 'object') {
      // Handle Firestore Timestamp object with toDate method
      if (typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        // Try to convert object to date
        date = new Date(dateInput);
      }
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateInput);
    return 'Invalid date';
  }
};

export const formatDateTime = (dateInput: string | Date | any): string => {
  try {
    let date: Date;
    
    if (!dateInput) {
      return 'No date';
    }
    
    if (typeof dateInput === 'string') {
      // Handle Firestore timestamp format: seconds_nanoseconds
      if (dateInput.includes('_') && /^\d+_\d+$/.test(dateInput)) {
        const [seconds, nanoseconds] = dateInput.split('_');
        date = new Date(parseInt(seconds) * 1000 + parseInt(nanoseconds) / 1000000);
      } else {
        date = new Date(dateInput);
      }
    } else if (dateInput && typeof dateInput === 'object') {
      // Handle Firestore Timestamp object with toDate method
      if (typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        date = new Date(dateInput);
      }
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error, dateInput);
    return 'Invalid date';
  }
};
