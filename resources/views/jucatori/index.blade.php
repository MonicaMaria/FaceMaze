@extends ('layout')

@section('content')
<header class="container">
				<div class="row" id="logo">
					<img class="col-lg-offset-5 col-lg-2 col-md-offset-5 col-md-2 col-sm-offset-5 col-sm-2 col-xs-offset-4 col-xs-4" src="img/white_logo.png">
				</div>
		</header>
<h1>Jucatorii</h1>

@foreach ($jucatori as $juc)
	<div>
	{{ $juc->name}} {{$juc->email}} {{$juc->score}} puncte
	</div>
@endforeach
@stop