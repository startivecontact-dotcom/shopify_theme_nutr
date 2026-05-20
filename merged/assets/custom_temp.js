$( document ).ready(function() {

  /*GB! free product added STARTS*/ 
  var amount_free_product = 5000;
     setTimeout(function () {
        var cart_total = $('.gb-totals-total-value').text(); 
        if(cart_total >= amount_free_product ) { 
           if($(".cart-item").hasClass("gb-find-remove-product")) {
           }else{
             $('.gb-free-product-tirgger').trigger('click'); 
           }
            
         } else {
            $('.gb-remove-product').trigger('click');  
         }
      }, 3000);  
  $('body').on('click', '.gb-sumbit-free', function(){
     var amount_free_product = 5000;
     setTimeout(function () {
        var cart_total = $('.gb-totals-total-value').text(); 
        if(cart_total >= amount_free_product ) { 
           if($(".cart-item").hasClass("gb-find-remove-product")) {
           }else{
             $('.gb-free-product-tirgger').trigger('click'); 
           }
            
         } else {
            $('.gb-remove-product').trigger('click');  
         }
      }, 3000);
       
  });
  $('body').on('click', '.shop-add-to-cart-button', function(){
     var amount_free_product = 5000;
     setTimeout(function () {
        var cart_total = $('.gb-totals-total-value').text(); 
        if(cart_total >= amount_free_product ) { 
           if($(".cart-item").hasClass("gb-find-remove-product")) {
           }else{
             $('.gb-free-product-tirgger').trigger('click'); 
           }
            
         } else {
            $('.gb-remove-product').trigger('click');  
         }
      }, 3000);
       
  });
  $('body').on('click', '.quantity__button', function(){
     var amount_free_product = 5000;
     setTimeout(function () {
        var cart_total = $('.gb-totals-total-value').text(); 
        if(cart_total >= amount_free_product ) { 
           if($(".cart-item").hasClass("gb-find-remove-product")) {
           }else{
             $('.gb-free-product-tirgger').trigger('click'); 
           }
         } else {
            $('.gb-remove-product').trigger('click');  
         }
      }, 3000);
       
  }); 
  $('body').on('keyup', '.quantity__input', function(){
     var amount_free_product = 5000;
     setTimeout(function () {
        var cart_total = $('.gb-totals-total-value').text(); 
        if(cart_total >= amount_free_product ) { 
           if($(".cart-item").hasClass("gb-find-remove-product")) {
           }else{
             $('.gb-free-product-tirgger').trigger('click'); 
           }
         } else {
            $('.gb-remove-product').trigger('click');  
         }
      }, 3000);
       
  });
  $('body').on('click', '.cart-remove-button', function(){
     var amount_free_product = 5000;
     setTimeout(function () {
        var cart_total = $('.gb-totals-total-value').text(); 
        if(cart_total >= amount_free_product ) { 
           if($(".cart-item").hasClass("gb-find-remove-product")) {
           }else{
             $('.gb-free-product-tirgger').trigger('click'); 
           } 
         } else {
            $('.gb-remove-product').trigger('click');  
         }
      }, 3000);
       
  });   

   $('body').on('click', '.gb-shipping-protection-button label.switch.unchecked', function(){ 
          $('.gb-product-shipping-protection-product-tirgger').trigger('click');
   }); 
    $('body').on('click', '.gb-shipping-protection-button label.switch.checked', function(){
          $('.gb-remove-product-shipping-protection').trigger('click');
   }); 

   $('body').on('change', '.gb-change-variant_id', function(){ 
      var id_change = $(this).find(":selected").attr('data-variant-id');                                                          
      $(this).closest('.gb-get-main-freq-pro').find('.product-variant-id').val(id_change); 
   }); 


 /* $('.gbfrequently-bought-with-main-whole-slider').slick({
        infinite: true,
        autoplaySpeed: 1000,
        autoplay: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        // adaptiveHeight: true
        //prevArrow: $('.our-customer-slider-prev'),
        //nextArrow: $('.our-customer-slider-next'),
   });   */


  
});  