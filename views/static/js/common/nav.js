$("#side_nav").click(function() {
	if ($('#top_menu').css('display') == 'none') {
		$('#top_menu').show();
		$('#top_center').hide();
		$('#go_shopping_cart').hide();
	} else {
		$('#top_menu').hide();
		$('#top_center').show();
		$('#go_shopping_cart').show();
	}
});
