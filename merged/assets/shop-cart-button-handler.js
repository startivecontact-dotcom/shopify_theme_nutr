/**
 * Shop Cart Button Handler
 * Makes all "Add to Cart" buttons use the cart drawer
 * Simple standalone implementation to avoid conflicts with other scripts
 */

document.addEventListener('DOMContentLoaded', function() {
  // Disable this script if cart drawer doesn't exist
  const cartDrawer = document.querySelector('cart-drawer');
  if (!cartDrawer) return;
  
  // Get all product forms
  const productForms = document.querySelectorAll('form[action="/cart/add"]');
  
  productForms.forEach(form => {
    // Skip if already handled by another script
    if (form.classList.contains('drawer-initialized')) return;
    form.classList.add('drawer-initialized');
    
    form.addEventListener('submit', function(event) {
      // Stop the normal form submission
      event.preventDefault();
      
      // Get the submit button
      const submitButton = form.querySelector('[type="submit"]');
      let loadingSpinner = submitButton?.querySelector('.loading__spinner');
      
      // Show loading state
      if (submitButton) {
        submitButton.setAttribute('aria-disabled', 'true');
        submitButton.classList.add('loading');
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
      }
      
      // Get form data
      const formData = new FormData(form);
      
      // Add required sections for cart drawer
      formData.append('sections', 'cart-drawer,cart-icon-bubble');
      formData.append('sections_url', window.location.pathname);
      
      // Submit form with fetch
      fetch(window.routes.cart_add_url, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      })
      .then(response => response.json())
      .then(response => {
        if (response.status) {
          // Handle error
          console.error('Error adding to cart:', response.description);
          
          // Show error message if there's a container for it
          const errorContainer = form.querySelector('.product-form__error-message');
          if (errorContainer) {
            errorContainer.textContent = response.description || 'Error adding to cart';
            errorContainer.closest('.product-form__error-message-wrapper')?.removeAttribute('hidden');
          } else {
            // Fallback to alert if no error container found
            alert(response.description || 'Error adding product to cart');
          }
        } else {
          // Success! Render cart drawer
          cartDrawer.renderContents(response);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // Fallback to traditional submission on error
        form.submit();
      })
      .finally(() => {
        // Reset loading state
        if (submitButton) {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('aria-disabled');
          if (loadingSpinner) loadingSpinner.classList.add('hidden');
        }
      });
    });
  });
}); 