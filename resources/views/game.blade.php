@extends ('layout')

@section('content')
	<section class="container">
			<div id="game-view" class="row"></div>
			
			<!-- Modal -->
			<div class="modal fade" id="GameOver" role="dialog">
			    <div class="modal-dialog">
			    
			      <!-- Modal content-->
			      <div class="modal-content">
			        <div class="modal-header">
			          <h3 class="modal-title">Game Over!</h3>
					  <h4 id="gamescore">Your score is </h4>
			        </div>
			        <div class="modal-body btn-group-vertical">
			          <button type="button" class="btn" data-dismiss="modal" onClick="location.href='game'">Play Again!</button>
			          <button type="button" class="btn" data-dismiss="modal" onClick="location.href='mainpage'">Return to Menu</button>
			        </div>
			      </div>
			      
			    </div>
			</div>


            <div class="btn-group col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-4 col-sm-offset-4 col-xs-4 col-xs-offset-4" role="group" aria-label="...">
				<button type="button" class="btn" id="btn-menu-game" data-toggle="modal" data-target="#PauseMenu" onClick = "pauseGame()">Menu</button>

			</div>
			<!-- Modal -->
			<div class="modal fade" id="PauseMenu" role="dialog">
			    <div class="modal-dialog">
			    
			      <!-- Modal content-->
			      <div class="modal-content">
			        <div class="modal-header">
			          <h4 class="modal-title">Paused</h4>
			        </div>
			        <div class="modal-body btn-group-vertical">
			          <button type="button" class="btn" data-dismiss="modal" onClick = "unpauseGame()">Resume</button>
			          <button type="button" class="btn" id="btn-mute" onClick = "stopMusic()">Mute</button>
			          <button type="button" class="btn hide" id="btn-unmute" onClick = "startMusic()">Unmute</button>
			          <button type="button" class="btn" data-dismiss="modal" onClick="location.href='mainpage'">Quit</button>

			        </div>
			      </div>
			      
			    </div>
			</div>
		</section>
		<footer>
		</footer>
		<script src="js/pixi.min.js"></script>
		<script src="js/buzz.min.js"></script>
		<script src="js/game.min.js"></script>
		<script src="js/btn_music_behaviour.js"></script>

@stop