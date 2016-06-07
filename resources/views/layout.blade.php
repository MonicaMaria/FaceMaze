<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
		<meta name="description" content="Game made by Ion Cristian, Popescu Alexandru, Monica Vizitiu from Faculty of Computer Science Iasi">
		<meta name="viewport" content="width=device-width,initial-scale=1.0">
		<meta name="csrf-token" content="{{ csrf_token() }}" />
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
  		<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
		<script src="js/edit_click_behaviour.js"></script>
		<!-- Bootstrap -->
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
		<link rel="stylesheet" href="css/app.css">
		<title>FaceMaze</title>
    </head>
    <body>
    	<script type="text/javascript">$.ajaxSetup({headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}});</script>
        @yield('content')
    </body>
</html>
