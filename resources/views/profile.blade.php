@extends ('layout')

@section('content')

<header class="container">
				<div class="row" id="logo">
					<img class="col-lg-offset-5 col-lg-2 col-md-offset-5 col-md-2 col-sm-offset-5 col-sm-2 col-xs-offset-4 col-xs-4" src="img/white_logo.png" alt="Logo FaceMaze">
				</div>
		</header>

			<section class="container">
				<div id="profile-view" class="row">
					<h3>Profile</h3>
                    <form action="update" method="post">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">                        
                        <ul>
                            <li>
                                <div class="row">
                                    <div class="col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8">
                                        <div class="input-group">
                                            <span class="input-group-btn">
                                                <button class="btn disabled" type="button">Name</button>
                                            </span>
                                            <input id="input-name" name="name" type="text" class="form-control" value="{{ Auth::user()->name }}" readonly>
                                            <span class="input-group-btn ">
                                                <button class="btn icon" id="btn-icon-1" type="button">
                                                    <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="row">
                                    <div class="col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8">
                                        <div class="input-group">
                                            <span class="input-group-btn">
                                                <button class="btn disabled" type="button">E-mail</button>
                                            </span>
                                            <input id="input-mail" name="email" type="text" class="form-control" value="{{ Auth::user()->email }}" readonly>
                                            <span class="input-group-btn ">
                                                <button class="btn icon" id="btn-icon-3" type="button">
                                                    <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="row">
                                    <div class="col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8">
                                        <div class="input-group">
                                            <span class="input-group-btn">
                                                <button class="btn disabled" type="button">High Score</button>
                                            </span>
                                            <input type="text" class="form-control" value="{{ Auth::user()->score }}" readonly>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="row">
                                    <div class="col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8">
                                        <div class="btn-group" role="group" aria-label="...">
                                            <button type="button" class="btn" onClick="location.href='mainpage'">BACK</button>
                                            <button id="btn-save-changes" type="submit" class="btn disabled">SAVE CHANGES</button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </form>
				</div>
			</section>
            <footer>
                <div id="error" class="alert alert-dismissible fade in" role="alert">
                </div>
            </footer>
            <script>
                var error = '{{ $error }}';
                console.log(error);
                if(error != '0')
                {
                    var textnode = document.createTextNode(error);
                    var d = document.getElementById("error");
                    d.appendChild(textnode);
                    d.className += " alert-warning";
                }
            </script>
@stop