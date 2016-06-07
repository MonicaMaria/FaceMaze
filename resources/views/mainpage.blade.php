@extends ('layout')

@section('content')

<header class="container">
				<div class="row" id="logo">
					<img class="col-lg-offset-5 col-lg-2 col-md-offset-5 col-md-2 col-sm-offset-5 col-sm-2 col-xs-offset-4 col-xs-4" src="img/white_logo.png" alt="Logo FaceMaze">
				</div>
		</header>

			<div class="container">
				<div id="menu-view" class="row">
					<div class="btn-group-vertical" role="group" aria-label="...">
						<button type="button" onClick="location.href='game'" class="btn">PLAY</button>
						<button type="button" onClick="location.href='profile'" class="btn">PROFILE</button>
						<button type="button" class="btn" onClick="location.href='scores'">HIGHSCORES</button>
						<button type="button" class="btn"  onClick="location.href='logout'">LOG OUT</button>
					</div>	
				</div>
			</div>
@stop
			