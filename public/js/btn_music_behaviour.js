$( document ).ready(function() {
    $("#btn-mute").click(function(){
        $("#btn-mute").addClass('hide');
        $("#btn-unmute").removeClass('hide');
    });
    $("#btn-unmute").click(function(){
        $("#btn-unmute").addClass('hide');
        $("#btn-mute").removeClass('hide');
    });
});