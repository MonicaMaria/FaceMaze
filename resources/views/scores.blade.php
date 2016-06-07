@extends ('layout')

@section('content')

<header class="container">
				<div class="row" id="logo">
					<img class="col-lg-offset-5 col-lg-2 col-md-offset-5 col-md-2 col-sm-offset-5 col-sm-2 col-xs-offset-4 col-xs-4" src="img/white_logo.png" alt="Logo FaceMaze">
				</div>
		</header>

			<section class="container">
				<div id="highscores-view" class="row">
					<h3>Highscores</h3>
					<ul class="col-lg-6 col-lg-offset-3 col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1">
					@foreach ($jucatori as $juc)
						<li>
							<span>{{ $juc->name}} </span><span>{{$juc->score}}</span>
						</li>
					@endforeach
					</ul>
					<div class="clearfix"></div>
					<div class="btn-group col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-4 col-sm-offset-4 col-xs-4 col-xs-offset-4" role="group" aria-label="...">
						<button type="button" class="btn" onClick="location.href='mainpage'">BACK</button>
					</div>
				</div>
			</section>
            <footer>
			</footer>
@stop