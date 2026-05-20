if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        this.originalButtonText = '';
        this.persistentTextActive = false;
      }

      connectedCallback() {
        setTimeout(() => {
          this.form = this.querySelector('form');
          if (!this.form) return;

          const variantInput = this.variantIdInput;
          if (variantInput) variantInput.disabled = false;
          
          this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
          this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
          this.submitButton = this.querySelector('[type="submit"]');
          if (!this.submitButton) return;

          this.submitButtonText = this.submitButton.querySelector('.button-text');
          
          // Store the original button text for reference
          if (this.submitButtonText) {
            this.originalButtonText = this.submitButtonText.textContent;
            this.submitButton.dataset.originalText = this.originalButtonText;
          }
          
          // Check for text override attribute first (new priority approach)
          if (this.submitButton.dataset.textOverride === 'true' && this.submitButtonText) {
            const overrideText = this.submitButton.dataset.persistentText;
            if (overrideText) {
              this.submitButtonText.textContent = overrideText;
            }
          }
          // Then handle traditional persistent text
          else if (this.submitButton.classList.contains('has-persistent-text') && this.submitButtonText) {
            this.persistentTextActive = true;
            const persistentText = this.submitButton.dataset.persistentText;
            
            if (persistentText) {
              this.submitButtonText.textContent = persistentText;
              localStorage.setItem('addToCartButtonText', persistentText);
            } else {
              // Check if there's a stored persistent text
              const storedText = localStorage.getItem('addToCartButtonText');
              if (storedText) {
                this.submitButtonText.textContent = storedText;
                this.submitButton.dataset.persistentText = storedText;
              }
            }
          }

          // Set up mutation observer to catch any attempts to change the button text
          if ((this.persistentTextActive || this.submitButton.dataset.textOverride === 'true') && this.submitButtonText) {
            this.setupButtonTextObserver();
          }

          if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

          this.hideErrors = this.dataset.hideErrors === 'true';
          
          // Handle variant change events
          document.addEventListener('variant:change', this.handleVariantChange.bind(this));
        }, 100);
      }
      
      setupButtonTextObserver() {
        if (!this.submitButtonText) return;
        
        const config = { characterData: true, childList: true, subtree: true };
        
        // Check for text override first
        if (this.submitButton.dataset.textOverride === 'true') {
          const overrideText = this.submitButton.dataset.persistentText;
          if (overrideText) {
            this.buttonTextObserver = new MutationObserver((mutations) => {
              if (this.submitButtonText.textContent !== overrideText) {
                this.submitButtonText.textContent = overrideText;
              }
            });
            this.buttonTextObserver.observe(this.submitButtonText, config);
            return;
          }
        }
        
        // Fall back to persistent text
        if (this.persistentTextActive) {
          const persistentText = this.submitButton.dataset.persistentText || localStorage.getItem('addToCartButtonText');
          
          if (!persistentText) return;
          
          this.buttonTextObserver = new MutationObserver((mutations) => {
            // Only change it back if it actually changed
            if (this.submitButtonText.textContent !== persistentText) {
              this.submitButtonText.textContent = persistentText;
            }
          });
          
          this.buttonTextObserver.observe(this.submitButtonText, config);
        }
      }
      
      handleVariantChange(event) {
        if (!this.submitButtonText) return;
        
        // Small delay to ensure other scripts have run
        setTimeout(() => {
          // Check for text override first
          if (this.submitButton.dataset.textOverride === 'true') {
            const overrideText = this.submitButton.dataset.persistentText;
            if (overrideText) {
              this.submitButtonText.textContent = overrideText;
              return;
            }
          }
          
          // Then check for persistent text
          if (this.persistentTextActive) {
            const persistentText = this.submitButton.dataset.persistentText || localStorage.getItem('addToCartButtonText');
            if (persistentText) {
              this.submitButtonText.textContent = persistentText;
            }
          }
        }, 50);
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            // Check for text override first - this takes priority
            if (!this.error && this.submitButton.dataset.textOverride === 'true') {
              if (this.submitButton.dataset.persistentText && this.submitButtonText) {
                this.submitButtonText.textContent = this.submitButton.dataset.persistentText;
              }
            }
            // If there's persistent text, reapply it here as well
            else if (!this.error && this.persistentTextActive) {
              const persistentText = this.submitButton.dataset.persistentText || localStorage.getItem('addToCartButtonText');
              if (persistentText && this.submitButtonText) {
                this.submitButtonText.textContent = persistentText;
              }
            }

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          
          // Check for text override first - this takes highest priority
          if (this.submitButton.dataset.textOverride === 'true') {
            const overrideText = this.submitButton.dataset.persistentText;
            if (overrideText) {
              this.submitButtonText.textContent = overrideText;
              return;
            }
          }
          // If persistent text is active, use that
          else if (this.persistentTextActive) {
            const persistentText = this.submitButton.dataset.persistentText || localStorage.getItem('addToCartButtonText');
            if (persistentText) {
              this.submitButtonText.textContent = persistentText;
              return;
            }
          }
          
          // Use the original text that was stored earlier
          if (this.originalButtonText) {
            this.submitButtonText.textContent = this.originalButtonText;
          } else if (this.submitButton.dataset.originalText) {
            this.submitButtonText.textContent = this.submitButton.dataset.originalText;
          } else {
            // Fallback to default
            this.submitButtonText.textContent = window.variantStrings.addToCart;
          }
        }
      }

      disconnectedCallback() {
        // Clean up the observer if component is removed
        if (this.buttonTextObserver) {
          this.buttonTextObserver.disconnect();
        }
        
        // Remove variant change listener
        document.removeEventListener('variant:change', this.handleVariantChange);
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
