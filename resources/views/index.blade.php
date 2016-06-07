@extends ('layout')

@section('content')

	     <div id="fb-root"></div>
			<header class="container">
				<div class="row" id="logo">
					<img class="col-lg-offset-5 col-lg-2 col-md-offset-5 col-md-2 col-sm-offset-5 col-sm-2 col-xs-offset-4 col-xs-4" src="img/white_logo.png" alt="Logo FaceMaze">
				</div>
			</header>
	
			<div class="container">
				<div id="login-view" class="row">
					<label>LOG IN</label>
					<div class="btn-group-vertical col-lg-6 col-md-6 col-sm-6 col-xs-12" role="group" aria-label="...">
                        <button type="button" class="btn" onclick="window.location.href='auth/facebook'">LOG IN WITH FACEBOOK</button>
                        @if ($fb_status === TRUE)
                            <span class="glyphicon glyphicon-ok" id="icon-ok-1" aria-hidden="true"></span>
                        @else
                            <span class="glyphicon glyphicon-remove" id="icon-remove-1" aria-hidden="true"></span>
                        @endif
                        <button type="button" class="btn" onclick="window.location.href='twitter'">LOG IN WITH TWITTER</button>
                        @if ($tw_status === TRUE)
                            <span class="glyphicon glyphicon-ok" id="icon-ok-2" aria-hidden="true"></span>
                        @else
                            <span class="glyphicon glyphicon-remove" id="icon-remove-2" aria-hidden="true"></span>
                        @endif
					</div>
				</div>
			</div>
			<footer>
				<!-- <div class="alert alert-warning alert-dismissible fade in" role="alert">
					<button type="button" class="close" data-dismiss="alert" aria-label="Close">
					    <span aria-hidden="true">&times;</span>
					</button>
					<strong>Holy guacamole!</strong> You are here for the first time! Please register with twitter.
				</div> -->
			</footer>
@stop