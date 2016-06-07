$( document ).ready(function() {
    $( "#btn-icon-1" ).click(function() {
  		$("#input-name").removeAttr('readonly');
  		$("#input-name").removeAttr('value');
  		$("#input-name").focus();
  		$("#btn-save-changes").removeClass('disabled');
	});
	$( "#btn-icon-2" ).click(function() {
  		$("#input-lname").removeAttr('readonly');
  		$("#input-lname").removeAttr('value');
  		$("#input-lname").focus();
  		$("#btn-save-changes").removeClass('disabled');
	});
	$( "#btn-icon-3" ).click(function() {
  		$("#input-mail").removeAttr('readonly');
  		$("#input-mail").removeAttr('value');
  		$("#input-mail").focus();
  		$("#btn-save-changes").removeClass('disabled');
	});
});