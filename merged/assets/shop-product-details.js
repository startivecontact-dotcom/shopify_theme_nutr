// Global quantity selector handler
document.addEventListener("DOMContentLoaded", function () {
  // Find all forms that might have quantity selectors
  const productForms = document.querySelectorAll(
    'form[data-type="add-to-cart-form"]'
  );

  productForms.forEach((form) => {
    // Find quantity inputs associated with this form
    const formId = form.id;
    const quantityInputs = document.querySelectorAll(
      `input[name="quantity"][form="${formId}"], .modern-quantity-selector .quantity-input[form="${formId}"]`
    );

    if (quantityInputs.length === 0) return;

    // Override form submission
    form.addEventListener("submit", function (e) {
      // Get the first visible quantity input
      const activeQuantityInput = quantityInputs[0];
      const quantity = parseInt(activeQuantityInput.value) || 1;

      // Remove any existing hidden quantity inputs
      form
        .querySelectorAll('input[type="hidden"][name="quantity"]')
        .forEach((input) => {
          input.remove();
        });

      // Create a new hidden input with the current quantity
      const qtyInput = document.createElement("input");
      qtyInput.type = "hidden";
      qtyInput.name = "quantity";
      qtyInput.value = quantity;

      // Add the hidden input to the form
      form.appendChild(qtyInput);
    });
  });

  // Handle responsive product titles
  function handleResponsiveProductTitles() {
    const productTitles = document.querySelectorAll(
      ".shop-product-title[data-font-size][data-mobile-font-size]"
    );

    productTitles.forEach((title) => {
      function adjustTitleFontSize() {
        const desktopSize = title.getAttribute("data-font-size");
        const mobileSize = title.getAttribute("data-mobile-font-size");

        if (window.innerWidth <= 767) {
          title.style.setProperty("font-size", `${mobileSize}px`, "important");
        } else {
          title.style.setProperty("font-size", `${desktopSize}px`, "important");
        }
      }

      // Run immediately
      adjustTitleFontSize();

      // Add resize event listener if not already added
      if (!title.hasAttribute("data-resize-listener-added")) {
        window.addEventListener("resize", adjustTitleFontSize);
        title.setAttribute("data-resize-listener-added", "true");
      }
    });
  }

  // Initialize responsive product titles
  handleResponsiveProductTitles();

  // Handle FAQ accordions
  function initFaqAccordions() {
    const faqContainers = document.querySelectorAll(".product-faq");

    faqContainers.forEach((faqContainer) => {
      const faqId = faqContainer.id;
      if (!faqId) return;

      const faqItems = faqContainer.querySelectorAll(".faq-item");
      const innerFaqContainer = faqContainer.querySelector(".faq-container");
      const isAccordion =
        innerFaqContainer &&
        innerFaqContainer.getAttribute("data-accordion") === "true";

      faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        if (!question) return;

        // Only add click listener if it doesn't already have one
        if (!question.hasAttribute("data-click-listener-added")) {
          question.setAttribute("data-click-listener-added", "true");

          question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            // Close all other items first if accordion mode is enabled
            if (isAccordion && !isActive) {
              faqItems.forEach((otherItem) => {
                otherItem.classList.remove("active");
              });
            }

            // Toggle the clicked item
            item.classList.toggle("active");
          });
        }
      });
    });
  }

  // Initialize FAQ accordions
  initFaqAccordions();

  // Initialize product gallery functionality
  initProductGallery();
  
  // Listen for variant image changes
  document.addEventListener('variant:imageChanged', function(event) {
    if (event.detail && event.detail.image) {
      updateGalleryWithVariantImage(event.detail.image);
    }
  });
});

// Other product details JavaScript can go here

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    document.querySelectorAll(".kaching-bundles__bar").forEach(function (bar) {
      bar.addEventListener("click", function () {
        // Get pricing values
        const pricingContainer = bar.querySelector(
          ".kaching-bundles__bar-pricing"
        );
        const priceElement = pricingContainer.querySelector(
          ".kaching-bundles__bar-price"
        );
        const fullPriceElement = pricingContainer.querySelector(
          ".kaching-bundles__bar-full-price"
        );

        const price = priceElement ? priceElement.textContent.trim() : null;
        const fullPrice = fullPriceElement
          ? fullPriceElement.textContent.trim()
          : null;

        // Find parent product info block
        const productInfo = bar.closest(".shop-product-info");

        if (productInfo && price && fullPrice) {
          const buttonTextContainer = productInfo.querySelector(
            ".shop-add-to-cart-button .button-text"
          );
          if (buttonTextContainer) {
            setTimeout(function () {
              buttonTextContainer.innerHTML = `Add to Cart - ${price} <span class="compare-price">${fullPrice}</span>`;
            }, 50);
          }
        }
      });
    });
  }, 1000);
});

function initProductGallery() {
  const mainImages = document.querySelectorAll('.shop-main-image');
  const thumbnails = document.querySelectorAll('.shop-thumbnail');
  const prevArrow = document.querySelector('.shop-prev-arrow');
  const nextArrow = document.querySelector('.shop-next-arrow');
  
  if (!mainImages.length || !thumbnails.length) return;
  
  // Add necessary styles for proper gallery display
  mainImages.forEach((img, index) => {
    // Handle the display for non-active images
    if (!img.classList.contains('active')) {
      img.style.display = 'none';
    } else {
      img.style.display = 'block';
    }
  });
  
  // Set up navigation arrows
  let currentIndex = 0;
  const maxIndex = mainImages.length - 1;
  
  // Find the initial active image
  mainImages.forEach((img, index) => {
    if (img.classList.contains('active')) {
      currentIndex = index;
      img.style.display = 'block';
    }
  });
  
  // Update arrow states
  function updateArrowStates() {
    prevArrow.classList.toggle('disabled', currentIndex === 0);
    nextArrow.classList.toggle('disabled', currentIndex === maxIndex);
  }
  
  // Change the active image
  function changeImage(index) {
    if (index < 0 || index > maxIndex) return;
    
    // Deactivate current image and thumbnail
    mainImages[currentIndex].classList.remove('active');
    mainImages[currentIndex].style.display = 'none';
    thumbnails[currentIndex].classList.remove('active');
    
    // Update current index
    currentIndex = index;
    
    // Activate new image and thumbnail
    mainImages[currentIndex].classList.add('active');
    mainImages[currentIndex].style.display = 'block';
    thumbnails[currentIndex].classList.add('active');
    
    // Ensure the thumbnail is visible in the scroll area
    thumbnails[currentIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
    
    updateArrowStates();
  }
  
  // Handle thumbnail clicks
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', function() {
      changeImage(index);
    });
  });
  
  // Handle arrow clicks
  prevArrow.addEventListener('click', function() {
    if (currentIndex > 0) {
      changeImage(currentIndex - 1);
    }
  });
  
  nextArrow.addEventListener('click', function() {
    if (currentIndex < maxIndex) {
      changeImage(currentIndex + 1);
    }
  });
  
  // Initialize arrow states
  updateArrowStates();
  
  // Make the changeImage function available globally for the variant switcher
  window.changeImage = changeImage;
}

function updateGalleryWithVariantImage(variantImage) {
  const carouselImages = document.querySelectorAll('.shop-main-image');
  if (carouselImages.length === 0) return;
  
  // Get the variant image filename (without query parameters)
  const variantImageUrl = variantImage.src ? variantImage.src.split('?')[0] : '';
  const variantImageFilename = variantImageUrl ? variantImageUrl.split('/').pop() : '';
  const variantId = variantImage.variant_id || '';
  const mediaId = variantImage.id || '';
  
  let matchFound = false;
  let matchedIndex = 0;
  
  // Try multiple approaches to match the variant image to carousel images
  carouselImages.forEach((img, index) => {
    // Get source URL from image or data-src attribute
    const imgSrc = img.src || img.getAttribute('data-src') || '';
    
    // Clean the image URL for comparison
    const imgUrlClean = imgSrc.split('?')[0];
    const imgFilename = imgUrlClean.split('/').pop();
    
    // Get media ID if available
    const imgMediaId = img.getAttribute('data-media-id');
    const variantMediaId = variantImage.id || '';
    
    // Get variant ID if available
    const imgVariantId = img.getAttribute('data-variant-id');
    
    // Try multiple matching methods
    const matchByFilename = imgFilename === variantImageFilename;
    const matchByMediaId = mediaId && imgMediaId && imgMediaId == mediaId;
    const matchByVariantId = variantId && imgVariantId && imgVariantId == variantId;
    const matchByFullUrl = imgUrlClean.includes(variantImageUrl) || variantImageUrl.includes(imgUrlClean);
    const matchByPartialUrl = variantImageUrl && imgUrlClean && (
      imgUrlClean.includes(variantImageFilename) || 
      variantImageUrl.includes(imgFilename)
    );
    
    if (matchByMediaId || matchByFilename || matchByFullUrl || matchByPartialUrl || matchByVariantId) {
      matchFound = true;
      matchedIndex = index;
      
      // Activate this image
      carouselImages.forEach(image => image.classList.remove('active'));
      img.classList.add('active');
      
      // Update thumbnails
      const thumbnails = document.querySelectorAll('.shop-thumbnail');
      if (thumbnails.length > 0) {
        thumbnails.forEach((thumb, i) => {
          thumb.classList.toggle('active', i === index);
        });
      }
      
      // Update indicators if present
      const indicators = document.querySelectorAll('.shop-indicator-dot');
      if (indicators.length > 0) {
        indicators.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
      
      // Update current index for gallery navigation
      if (typeof changeImage === 'function') {
        try {
          changeImage(index);
        } catch(e) {
          console.log('Error calling changeImage function:', e);
        }
      }
      
      return; // Exit the loop once we've found a match
    }
  });
  
  // If no match found by media ID or URL, try matching by variant ID
  if (!matchFound && variantId) {
    carouselImages.forEach((img, index) => {
      const dataVariantId = img.getAttribute('data-variant-id');
      if (dataVariantId && dataVariantId == variantId) {
        matchFound = true;
        matchedIndex = index;
        
        carouselImages.forEach(image => image.classList.remove('active'));
        img.classList.add('active');
        img.style.display = 'block';
        
        const thumbnails = document.querySelectorAll('.shop-thumbnail');
        if (thumbnails.length > 0) {
          thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
          });
        }
      }
    });
  }
  
  // If still no match, show the first image
  if (!matchFound) {
    carouselImages[0].classList.add('active');
    
    const thumbnails = document.querySelectorAll('.shop-thumbnail');
    if (thumbnails.length > 0) {
      thumbnails[0].classList.add('active');
    }
    
    const indicators = document.querySelectorAll('.shop-indicator-dot');
    if (indicators.length > 0) {
      indicators[0].classList.add('active');
    }
  }
}
