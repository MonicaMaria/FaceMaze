window.onload = load_game;

var resources = PIXI.loader.resources;
var stage = new PIXI.Container();
var renderer = PIXI.autoDetectRenderer(480, 640, {backgroundColor: 0x000000});
document.getElementById("game-view").appendChild(renderer.view);
stage.interactive = true;

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
const NONE = 4;

var container;
var graphics;
var player;
var player_dir;
var container_pill;
var bounds;
var pills_bonus = [];
var eaten_pills = 0;

var filter1 = new PIXI.filters.ColorMatrixFilter();
var filter2 = new PIXI.filters.ColorMatrixFilter();
var filter3 = new PIXI.filters.ColorMatrixFilter();
var filter4 = new PIXI.filters.ColorMatrixFilter();
var mazefilter = new PIXI.filters.ColorMatrixFilter();

var count = 0;
var fps = 30;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var gametimer = 3 * fps;
var paused_timer = 0;
var paused = false;
var paused_game = false;


var scoretext = new PIXI.Text('COUNT 4EVAR: 0', { font: 'bold 14px ArcadeRounded,Helvetica,Arial,sans-serif',align:'right', fill: '#fff'});
    scoretext.position.x = 400;
    scoretext.position.y = 490;
    scoretext.anchor.x = 0;

var leveltext = new PIXI.Text('COUNT 4EVAR: 0', { font: 'bold 14px ArcadeRounded,Helvetica,Arial,sans-serif', fill: '#fff'});
    leveltext.position.x = 0;
    leveltext.position.y = 490;
    leveltext.anchor.x = 0;

var starttext = new PIXI.Text('COUNT 4EVAR: 0', { font: 'bold 24px ArcadeRounded,Helvetica,Arial,sans-serif', fill: '#fff'});
    starttext.position.x = 480/2-10;
    starttext.position.y = 300;
    starttext.anchor.x = 0;


var maze = {};
var ghosts;
var level = 1;
var score = 0;
var lives = 3;
var player_image = '';


var sound_intro = new buzz.sound("sounds/pacman_intro.wav", {
});

var sound_eat_pill = new buzz.sound("/sounds/pill.mp3", {
});
sound_eat_pill.setSpeed(2);
sound_eat_pill.setVolume(50);

var sound_bonus = new buzz.sound("/sounds/powerpill.mp3", {
});

var sound_eat_ghost = new buzz.sound("/sounds/pacman_eatghost.wav", {
});

var sound_death = new buzz.sound("/sounds/pacman_death.wav", {
});

var fundal = new buzz.sound("/sounds/fundal.mp3", {
    loop: true
});
var fundal_pause = new buzz.sound("/sounds/pause.mp3", {
    loop: true
});

fundal_pause.setVolume(30);

var alarm = new buzz.sound("/sounds/pacman_alarm.wav", {
    loop: true
});
alarm.setVolume(100);



function load_game()
{
	var data = {
		score: score,
		lives: lives,
		level: level
	}

	$.ajax({
		url: "loadgame",
		type:"POST",
		data: data,
		success:function(data){
			var json = JSON.parse(data);

			if( json["gameover"] )
			{
				paused_game = true;
				fundal.stop();
				$("#GameOver").modal('show');
				var textnode = document.createTextNode(json["gameover"]);
				document.getElementById("gamescore").appendChild(textnode);
			}
			else {
				
				maze = json["maze"];
				ghosts = json["friends"];
				player_image = json["player_image"];

				// for(var i = 0; i < maze.h; i++)
				// 	console.log(maze.map[i]);

				PIXI.loader.add(['./gfx/line.jpg',
				  './gfx/corner.jpg',
				  './gfx/corner-inner.jpg',
				  './gfx/pill.png',
				  './gfx/pill_bonus.png'
				  ]).load(setup);

			}

		},error:function(){ 
			//alert("error ajax");
		}
	});
}

function next_level()
{
	if(eaten_pills == container_pill.children.length || lives == 0 )
	//if(eaten_pills == 3 || lives == 0 )
	{
		level++;
		PIXI.loader.reset();
		paused_game = true;
		fundal.stop();
		alarm.stop();
		load_game();
	}
}

function setup() {
	
	paused_game = false;
	gametimer = 3 * fps;
	sound_intro.play();

	ghosts[0].sprite = PIXI.Sprite.fromImage(ghosts[0].url);
	ghosts[1].sprite = PIXI.Sprite.fromImage(ghosts[1].url);
	ghosts[2].sprite = PIXI.Sprite.fromImage(ghosts[2].url);
	ghosts[3].sprite = PIXI.Sprite.fromImage(ghosts[3].url);

	player = PIXI.Sprite.fromImage(player_image);

	player.x = 16 * 14.5;
	player.y = 16 * 16;
	player.vx = -1;
	player.vy = 0;
	player.width = 40;
	player.height = 70;
	player.timer = 0;

	for(var i = 0; i < 4; i++)
	{
		ghosts[i].sprite.x = player.x;
		ghosts[i].sprite.y = player.y - 64;
		ghosts[i].state = "STATE_NONE";
		ghosts[i].dir = "DIR_NONE";
		ghosts[i].die = false;
		ghosts[i].startx = 16 * (16-i);
		ghosts[i].starty = 16 * 13;
		ghosts[i].startTimer = fps * (i*3+2);
	}

	ghosts[0].scatter_timer = 8;
	ghosts[0].scared_timer = 8;
	ghosts[0].chase_timer = 20;

	ghosts[1].scatter_timer = 8;
	ghosts[1].scared_timer = 8;
	ghosts[1].chase_timer = 20;
	
	ghosts[2].scatter_timer = 8;
	ghosts[2].scared_timer = 8;
	ghosts[2].chase_timer = 20;

	ghosts[3].scatter_timer = 8;
	ghosts[3].scared_timer = 8;
	ghosts[3].chase_timer = 20;

	player_dir = LEFT;
	player_last_dir = LEFT;

	eaten_pills = 0;

	var left = keyboard(37),
    	up = keyboard(38),
      	right = keyboard(39),
      	down = keyboard(40);

    left.press = function() {
    	player_dir = LEFT;
    }
    right.press = function() {
    	player_dir = RIGHT;
    }
    up.press = function() {
    	player_dir = UP;
    }
    down.press = function() {
    	player_dir = DOWN;
    }
	
	container_pill = new PIXI.Container();
	
	var pill_up_left = false;
	var pill_up_right = false;
	var pill_down_left = false;
	var pill_down_right = false;
	for( var i = 0; i < maze.h; i++ )
	{
		for( var j = 0; j < maze.w; j++ ) {
			if( maze.map[i][j] != 0) {
				if(i==16 && j<19 && j>10) continue;
				else 
				{
					var pill;
					var pill_b;
					var ok = false;
					
					pill = new PIXI.Sprite(resources["./gfx/pill.png"].texture);
					pill_b = new PIXI.Sprite(resources["./gfx/pill_bonus.png"].texture);
					
					var x = j * 16 + 8;
					var y = i * 16 + 8;
					
					if(j==4 && i < 10 && i > 3 && pill_up_left == false) {
						pill_up_left = true;
						ok = true;
					}
					else
						if(j==maze.w-5 && i < 10 && i > 3 && pill_up_right == false) {
							pill_up_right = true;
							ok = true;
						}
						else
							if(j==4 && i < 28 && i > 21 && pill_down_left == false) {
								pill_down_left = true;
								ok = true;
							}
							else
								if(j==maze.w-5 && i < 28 && i > 21 && pill_down_right == false) {
									pill_down_right = true;
									ok = true;
								}
					
					if(ok==true) {
						pill_b.width = 24;
						pill_b.height = 24;
						pill_b.x = x - pill_b.width/2;
						pill_b.y = y - pill_b.width/2;
						pills_bonus.push(pill_b);
						pill_b.visible = true;
						container_pill.addChild(pill_b);
					}
					else {
						pill.width = 6;
						pill.height = 6;
						pill.x = x - pill.width/2;
						pill.y = y - pill.width/2;
						pill.visible=true;
						container_pill.addChild(pill);
					}
				}
			}
		}
	}

	for (var i = stage.children.length - 1; i >= 0; i--) {
		stage.removeChild(stage.children[i]);
	}

	graphics = new PIXI.Graphics();

	ghosts[0].mask = new PIXI.Graphics();
	ghosts[1].mask = new PIXI.Graphics();
	ghosts[2].mask = new PIXI.Graphics();
	ghosts[3].mask = new PIXI.Graphics();

	container = new PIXI.Container();
	container.filters = [mazefilter];
	stage.addChild(container);
	stage.addChild(container_pill);
	stage.addChild(player);
	stage.addChild(graphics);

	stage.addChild(ghosts[0].sprite);
	stage.addChild(ghosts[0].mask);

	stage.addChild(ghosts[1].sprite);
	stage.addChild(ghosts[1].mask);
	
	stage.addChild(ghosts[2].sprite);
	stage.addChild(ghosts[2].mask);
	
	stage.addChild(ghosts[3].sprite);
	stage.addChild(ghosts[3].mask);

	stage.addChild(scoretext);
	stage.addChild(leveltext);
	stage.addChild(starttext);

	ghosts[0].sprite.filters = [filter1];
	ghosts[1].sprite.filters = [filter2];
	ghosts[2].sprite.filters = [filter3];
	ghosts[3].sprite.filters = [filter4];

	//stage.filters = [filter];

	player.mask = graphics;
	ghosts[0].sprite.mask = ghosts[0].mask;
	ghosts[1].sprite.mask = ghosts[1].mask;
	ghosts[2].sprite.mask = ghosts[2].mask;
	ghosts[3].sprite.mask = ghosts[3].mask;

	var wallTexture = {
	 	"1" : { 
	 		"src" : './gfx/line.jpg',
	 		"rot" : 180
	 	},
		"16" : {
			"src" : './gfx/line.jpg',
			"rot" : 0
		},
		"64" : {
			"src" : './gfx/line.jpg',
			"rot" : 90
		},
		"4" : {
			"src" : './gfx/line.jpg',
			"rot" : 270
		},
		"65" : {
			"src" : './gfx/corner.jpg',
			"rot" : 270
		},
		"5" : {
			"src" : './gfx/corner.jpg',
			"rot" : 0
		},
		"80" : {
			"src" : './gfx/corner.jpg',
			"rot" : 180
		},
		"20" : {
			"src" : './gfx/corner.jpg',
			"rot" : 90
		},
		"2" : {
			"src" : './gfx/corner-inner.jpg',
			"rot" : 180
		},
		"8" : { 
			"src" : './gfx/corner-inner.jpg',
			"rot" : 270
		},
		"32" : { 
			"src" : './gfx/corner-inner.jpg',
			"rot" : 0
		},
		"128" : {
			"src" : './gfx/corner-inner.jpg',
			"rot" : 90
		}
	};

	var dir = {
		up : 0x000001,
		up_right : 0x000002,
		right : 0x000004,
		down_right : 0x000008,
		down : 0x000010,
		down_left : 0x000020,
		left : 0x000040,
		up_left : 0x000080
	}


	for( var i = 0; i < maze.h; i++ )
	{
		for( var j = 0; j < maze.w; j++ )
		{
			if( maze.map[i][j] == 0)
			{
				var tileID = 0x0;
				var diagID = 0x0;
				var combine = 0x0;

				if( j == 0 )
				{
					if( i > 0 )
					{
						tileID |= (maze.map[i-1][j] );
						diagID |= (maze.map[i-1][j+1] << 1);
					}
					tileID |= (maze.map[i][j+1] << 2);
					if ( i < maze.h-1 )
					{
						diagID |= (maze.map[i+1][j+1] << 3);
						tileID |= (maze.map[i+1][j] << 4);
					}
				}
				else if ( j == maze.w - 1 )
				{
					if ( i > 0 )
					{
						tileID |= (maze.map[i-1][j] );
						diagID |= (maze.map[i-1][j-1] << 7);
					}
					tileID |= (maze.map[i][j-1] << 6);
					if( i < maze.h-1 )
					{
						tileID |= (maze.map[i+1][j] << 4);
						diagID |= (maze.map[i+1][j-1] << 5);
					}
				}

				if( i == 0 )
				{
					if(j > 0)
					{
						diagID |= (maze.map[i+1][j-1] << 5);
						tileID |= (maze.map[i][j-1] << 6);
					}
				
					tileID |= (maze.map[i+1][j] << 4);

					if( j < maze.w - 1 )
					{
						tileID |= (maze.map[i][j+1] << 2);
						diagID |= (maze.map[i+1][j+1] << 3);
					}
				}
				else if ( i == maze.h - 1 ) 
				{
					if( j > 0 )
					{
						tileID |= (maze.map[i][j-1] << 6);
						diagID |= (maze.map[i-1][j-1] << 7);
					}
					tileID |= (maze.map[i-1][j] );
					if( j < maze.w-1 )
					{
						diagID |= (maze.map[i-1][j+1] << 1);
						tileID |= (maze.map[i][j+1] << 2);
					}
				}
				

				if( i > 0 && i < maze.h-1 && j > 0 && j < maze.w-1 ) {
					tileID |= (maze.map[i-1][j] );
					diagID |= (maze.map[i-1][j+1] << 1);
					tileID |= (maze.map[i][j+1] << 2);
					diagID |= (maze.map[i+1][j+1] << 3);
					tileID |= (maze.map[i+1][j] << 4);
					diagID |= (maze.map[i+1][j-1] << 5);
					tileID |= (maze.map[i][j-1] << 6);
					diagID |= (maze.map[i-1][j-1] << 7);
				}
				
				var combine = tileID | diagID;
				var color = 0x0088ff;

				var str = "";

				if( diagID != 0x000000 )
				{
					if(tileID == 0x000000 ) {
						str += diagID;
					}
					else {
						str += tileID;
					}
				}
				else {
					if( tileID != 0x000000 ) {
						str += tileID;
					}
				}
				var tile = null;
				
				if( !wallTexture[str] )
				{

				}
				else {
					tile = new PIXI.Sprite(resources[wallTexture[str].src].texture);
					tile.position.x = j * 16 + 8;
					tile.position.y = i * 16 + 8;
					tile.anchor.x = 0.5;
					tile.anchor.y = 0.5;
					tile.rotation = wallTexture[str].rot * Math.PI / 180.0;
					container.addChild(tile);
				}
			}
		}
	}

		filtermat = [];
		filtermat[0] = 
		[ 4, 0, 0, 0, 0,
		0, 0, 0, 0, 0,
		0, 0, 3, 0, 0, 
		0, 0, 0, 0, 0];

		filtermat[1] = 
		[ 1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0, 
		0, 0, 0, 1, 0]
		filtermat[3] = [ 20, -4, -1, 0, 0,
		5, 1, 4, 0, 0,
		7, -2, -1, 0, 0, 
		0, 10, 9, 14, 0]

		filtermat[4] = [ 10, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 8, 0, 0, 
		0, 0, 0, 1, 0]

		filtermat[5] = [ 2, 0, 0, 0, 0,
		0, 10, 0, 0, 0,
		0, 0, 0.5, 0, 0, 
		0, 0, 0, 1, 0]

		filtermat[2] = [ 4, 0, 0, 0, 0,
		0, 0.5, 0, 0, 0,
		0, 0, 0.5, 0, 0, 
		0, 0, 0, 1, 0]

		filtermat[6] = [ 8, 0, 0, 0, 0,
		0, 0.5, 0, 0, 0,
		0, 0, 2, 0, 0, 
		0, 0, 0, 1, 0]

		filtermat[7] = [ 0.5, 0, 0, 0, 0,
		0, 8, 0, 0, 0,
		0, 0, 0.5, 0, 0, 
		0, 0, 0, 1, 0]

		filtermat[8] = [ 4, 0, 0, 0, 0,
		0, -1, 0, 0, 0,
		0, 0, 0.5, 0, 0, 
		0, 0, 0, 1, 0]

        mazefilter.matrix = filtermat[random(0, filtermat.length)].slice();

	state = play;

	gameloop();
}

function stopMusic(){
	for(var i in buzz.sounds) {
    	buzz.sounds[i].mute();
	}
}

function startMusic(){
	for(var i in buzz.sounds) {
    	buzz.sounds[i].unmute();
	}
}

function pauseGame(){
 if( paused_game == false )
 {
 	paused_game = true;
 	fundal.pause();
 	alarm.pause();
 	fundal_pause.play();
 }
}
function unpauseGame(){
 if( paused_game == true )
 {	
 	fundal_pause.stop();
 	paused_game = false;
 	if (fundal.isPaused())
 		fundal.play();
 	if (alarm.isPaused())
 		alarm.play();
 }
}

function gameloop() {

	requestAnimationFrame(gameloop);

	now = Date.now();
    delta = now - then;
     
    if (delta > interval) {

    	then = now - (delta % interval);
    	paused_timer ++;
    	if (paused_timer > fps * 5 && paused == true)
    	{
    		paused = false;
    		paused_timer = 0;
    	}
		state();

		draw();
	}
}


var tile = new PIXI.Sprite();

function draw(){

	if(paused == true || paused_game == true) return;

	player.x -= 12;
	player.y -= 12;

	graphics.clear();
	graphics.beginFill(0x000000, 1.0);
	graphics.drawCircle(player.x+20, player.y+20,18);
	graphics.endFill();

	for( var i = 0; i < 4; i++ )
	{
		ghosts[i].sprite.x -= 12;
		ghosts[i].sprite.y -= 12;

		var m = ghosts[i].mask;
		m.clear();
		m.beginFill(0x000000, 1.0);
		m.drawCircle(ghosts[i].sprite.x+20, ghosts[i].sprite.y+20,18);
		m.endFill();
	}

	scoretext.text = score*10 + '\nScore';
	leveltext.text = ' LEVEL ' + level + ' LIVES ' + lives;

	starttext.text = Math.round(gametimer / fps);
	if( gametimer == 0 )
		starttext.visible = false;
	else starttext.visible = true;

	renderer.render(stage);

	player.x += 12;
	player.y += 12;
	for( var i = 0; i < 4; i++ )
	{
		ghosts[i].sprite.x += 12;
		ghosts[i].sprite.y += 12;
	}
}

function play() {
	if(paused == true || paused_game == true) return;

	if( gametimer > 0 )
	{
		gametimer--;
		return;
	}
	updatePlayer();
	var ok = false;
	for (var i = 0 ; i < 4 ; i++)
		if(ghosts[i].state == "STATE_FRIGHTENED") ok = true;
	if (!ok) {
		alarm.stop(); 
		if (sound_intro.isEnded() && lives > 0)
			fundal.play();
	}
	updateGhosts();
	next_level();
}

function updateGhosts()
{
	var reset = false;
	filter1.matrix = [1, 0, 0, 0, 0,
	     			 -1, 0, 0, 0, 0,
	     			  0, 0, 0, 0, 0, 
	     			  0, 0, 0, 1, 0]

	filter2.matrix = [3, 0, 0, 0, 0,
	       			  0, 1, 0, 0, 0,
	     			  0, 0, 3, 0, 0, 
	     			  0, 0, 0, 1, 0]

	filter3.matrix = [0, 0, 0, 0, 0,
	     			  0, 1, 0, 0, 0,
	     			  0, 0, 4, 0, 0, 
	     			  0, 0, 0, 1, 0]

	filter4.matrix = [2, 0, 0, 0, 0,
	     			  0, 1, 0, 0, 0,
	     			  0, 0, 0, 0, 0, 
	     			  0, 0, 0, 1, 0]

	var fct = [updateRedGhost, updatePinkGhost, updateBlueGhost, updateOrangeGhost];

	for(var i = 0; i < 4; i++)
	{
		fct[i]();
		ghosts[i].timer++;
		if(ghosts[i].die == false) {
			if(ghosts[i].state == "STATE_FRIGHTENED" )
			{
				ghosts[i].sprite.x += ghosts[i].sprite.vx * 2;
				ghosts[i].sprite.y += ghosts[i].sprite.vy * 2;
			}
			else
			{
				ghosts[i].sprite.x += ghosts[i].sprite.vx * 4;
				ghosts[i].sprite.y += ghosts[i].sprite.vy * 4;
			}
		}
	}

}

function kill_ghost(ghost, cb) {
	if (player.x >= ghost.sprite.x && player.x < ghost.sprite.x + 16 && 
		player.y >= ghost.sprite.y && player.y < ghost.sprite.y + 16)
		{
			//ghost.sprite.visible = false;
			sound_eat_ghost.play();
			ghost.die = true;
			ghost.state = "STATE_REVIVE";
			ghost.timer = 0;
			score += 3;
			cb(ghost);
			return;
		}
	else ghost.state = "STATE_FRIGHTENED";
}

function revive(ghost, cb) {
	ghost.sprite.y = ghost.starty;
	ghost.sprite.x = ghost.startx;
	ghost.sprite.vx = 0;
	ghost.sprite.vy = 0;
	ghost.queue = [0,0,0,0];
	ghost.sprite.visible = true;
	if(ghost.timer > ghost.startTimer )
	{
		ghost.sprite.y = 16 * 10;
		ghost.sprite.x = 16 * 15;
		ghost.state = "STATE_SCATTER";
		ghost.timer = 0;
		ghost.die = false;
	}
	else 
	{
		ghost.state = "STATE_REVIVE";
	}
	cb(ghost);
}

function kill_player() {
	for (var i = 0; i < 4; i++)
	{
		if (ghosts[i].state != "STATE_FRIGHTENED" && ghosts[i].state != "STATE_REVIVE")
			if (player.x >= ghosts[i].sprite.x && player.x < ghosts[i].sprite.x + 16 && 
				player.y >= ghosts[i].sprite.y && player.y < ghosts[i].sprite.y + 16)
			{
				alarm.stop();
				fundal.stop();
				sound_death.play();
				
			
				for(var j = 0; j < 4; j++)
				{
					ghosts[j].die = true;
					ghosts[j].state = "STATE_REVIVE";
					ghosts[j].timer = 0;
				}
				
				lives--;
				player.x = 16 * 14.5;
				player.y = 16 * 16;
				player.vx = -1;
				player.vy = 0;
				player.timer = 2 * fps;

				var name = ghosts[i].name;
	            
				var data = {
			            name: name
			        }


			        $.ajax({
			            url: "gametweet",
			            type:"POST",
			            data: data,
			            success:function(data){
			                //alert(data);
			            },error:function(){ 
			               console.log("error ajax");
			            }
        			}); 

			    if(lives>0) {
					gametimer = 3 * fps;
					sound_intro.play();
				}

				return;
			}

	}
}

function stateFrightened(ghost, cb)
{
	count += 0.5;
	var last_vx = ghost.sprite.vx;
	var last_vy = ghost.sprite.vy;

	var ghostTileX = Math.floor(ghost.sprite.x / 16);
	var ghostTileY = Math.floor(ghost.sprite.y / 16);
	var rx = ghost.sprite.x % 16;
	var ry = ghost.sprite.y % 16;


	if( ry == 0 && rx == 0 )
 	{
 		var exitLeft = maze.map[ghostTileY][ghostTileX-1];
		var exitRight = maze.map[ghostTileY][ghostTileX+1];
		var exitUp = maze.map[ghostTileY-1][ghostTileX];
		var exitDown = maze.map[ghostTileY+1][ghostTileX];

		var dir = [exitUp, exitRight, exitDown, exitLeft];
		var dl = [-1, 0, 1, 0];
		var dc = [0, 1, 0, -1];

		var countlr = exitLeft + exitRight;
		var countud = exitUp + exitDown;
		var decision = 0;

		if( maze.map[ghostTileY][ghostTileX-1] == 0 || maze.map[ghostTileY][ghostTileX+1] == 0 )
			last_vx = 0;
		if( maze.map[ghostTileY-1][ghostTileX] == 0 || maze.map[ghostTileY+1][ghostTileX] == 0 )
			last_vy = 0;

		if((last_vx == 0 && last_vy == 0) || (countlr >= 1 && countud >= 1))
		{

			for(var i = 0; i < 4; i++)
			{
				if(ghost.queue[i] < 0) ghost.queue[i] = 0;
				if(ghost.queue[i] > 10) ghost.queue[i] = 10;
			}

			var d;

			var pos = 0;

			var start = random(0, 4);
			var arr = [start, start+1, start+2, start+3];
			for(var i = 0; i < 4; i++)
				arr[i] = arr[i] % 4;

			for(d = 0; d < 4; d++)
			{
				if(dir[arr[d]] == 1)
				{
					if( random(0,100) <= 100 - (10 * ghost.queue[arr[d]]) )
					{
						var temp = arr[d];
						ghost.sprite.vx = dc[temp];
						ghost.sprite.vy = dl[temp];
						ghost.queue[temp] += 8;
						ghost.queue[(temp+2)%4] += 8;
						pos = temp;
						break;
					}
				}
			}

			if(d == 4)
			{
				for(d = 3; d >= 0; d--)
				{
					if(dir[d] == 1)
					{
						ghost.sprite.vx = dc[d];
						ghost.sprite.vy = dl[d];
						pos = d;
						break;
					}
				}
			}

			for( d = 0; d < 4; d++ )
			{
				if( d != pos && d != ((pos+2)%4) )
				{
					ghost.queue[d] -= 8;
				}
			}

		}
	}
	cb(ghost);
}

function updateRedGhost()
{
	var ghost = ghosts[0];
	var state = ghost.state;

	var last_vx = ghost.sprite.vx;
	var last_vy = ghost.sprite.vy;

	switch(state)
	{
		case "STATE_NONE":
			ghost.sprite.y = 16 * 10;
			ghost.sprite.x = 16 * 16;
			ghost.sprite.vx = 0;
			ghost.sprite.vy = 0;
			ghost.queue = [0,0,0,0];
			nextState = "STATE_SCATTER";
			ghost.timer = 0;
			break;
		case "STATE_REVIVE":
			revive(ghost, function(out) {
				ghosts[0] = out;
			});
			nextState = ghost.state;
			break;
		case "STATE_SCATTER":
			stateFrightened(ghost,function(out){
				ghosts[0] = out;
			});

			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			if(ghost.timer >= fps * ghost.scatter_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_CHASE";
			}
			else nextState = "STATE_SCATTER";
			break;
		case "STATE_FRIGHTENED":
			kill_ghost(ghost, function(out){
				ghosts[0] = out;
			});
			stateFrightened(ghost,function(out){
				ghosts[0] = out;
			});

			var matrix = filter1.matrix;

		    matrix[1] = Math.sin(count) * 3;
		    matrix[2] = Math.cos(count);
		    matrix[3] = Math.cos(count) * 1.5;
		    matrix[4] = Math.sin(count / 3) * 2;
		    matrix[5] = Math.sin(count / 2);
		    matrix[6] = Math.sin(count / 4);

			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;


			if(ghost.timer >= fps * ghost.scared_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_CHASE";
				//alarm.stop();
			}
			else nextState = ghost.state;
			break;
		case "STATE_CHASE":
			nextState = "STATE_CHASE";
			var ghostTileX = Math.floor(ghost.sprite.x / 16);
			var ghostTileY = Math.floor(ghost.sprite.y / 16);
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var playerTileX = Math.floor(player.x / 16);
			var playerTileY = Math.floor(player.y / 16);

			var last_vx = ghost.sprite.vx;
			var last_vy = ghost.sprite.vy;

		 	if( ry == 0 && rx == 0 )
		 	{
		 		var exitLeft = maze.map[ghostTileY][ghostTileX-1];
				var exitRight = maze.map[ghostTileY][ghostTileX+1];
				var exitUp = maze.map[ghostTileY-1][ghostTileX];
				var exitDown = maze.map[ghostTileY+1][ghostTileX];

				var countlr = exitLeft + exitRight;
				var countud = exitUp + exitDown;

				if((last_vx == 0 && last_vy == 0) || (countlr >= 1 && countud >= 1))
				{
					if(!(ghostTileX == playerTileX && ghostTileY == playerTileY))
					{
						bfs(ghostTileX, ghostTileY, playerTileX, playerTileY, function(path){
							if(path.length > 0)
							{
								var dest = path[0];
								if((dest.x - ghost.sprite.x) != 0)
									ghost.sprite.vx = dest.x - ghostTileX;
								if((dest.y - ghost.sprite.y) != 0)
									ghost.sprite.vy = dest.y - ghostTileY;

								if(ghost.sprite.vx != 0)
									ghost.sprite.vx /= Math.abs(ghost.sprite.vx);
								if(ghost.sprite.vy != 0)
									ghost.sprite.vy /= Math.abs(ghost.sprite.vy);
							}
						});
					}
					else
					{
						ghost.sprite.vx = 0;
						ghost.sprite.vy = 0;
					}
				}

				if(ghost.timer >= fps * ghost.chase_timer)
				{
					ghost.timer = 0;
					nextState = "STATE_CHASE";
				}
			}
			break;
		default:
			nextState = "STATE_CHASE";
	}

	ghost.state = nextState;
}

function updatePinkGhost()
{
	var ghost = ghosts[1];
	var state = ghost.state;

	var last_vx = ghost.sprite.vx;
	var last_vy = ghost.sprite.vy;

	switch(state)
	{
		case "STATE_NONE":
			ghost.sprite.y = 16 * 13;
			ghost.sprite.x = 16 * 14;
			ghost.sprite.vx = 0;
			ghost.sprite.vy = 0;
			ghost.queue = [0,0,0,0];
			ghost.timer = 0;
			if(score > 0)
			{
				ghost.sprite.y = 16 * 10;
				ghost.sprite.x = 16 * 14;
				nextState = "STATE_SCATTER";
			}
			else nextState = "STATE_NONE";
			break;
		case "STATE_REVIVE":
			revive(ghost, function(out) {
				ghosts[1] = out;
			});
			nextState = ghost.state;
			break;
		case "STATE_SCATTER":
			stateFrightened(ghost,function(out){
				ghosts[1] = out;
			});

			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			if(ghost.timer >= fps * ghost.scatter_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_CHASE";
			}
			else nextState = "STATE_SCATTER";
			break;
		case "STATE_FRIGHTENED":
			kill_ghost(ghost, function(out){
				ghosts[1] = out;
			});
			stateFrightened(ghost,function(out){
				ghosts[1] = out;
			});
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var matrix = filter2.matrix;

		    matrix[1] = Math.sin(count) * 3;
		    matrix[2] = Math.cos(count);
		    matrix[3] = Math.cos(count) * 1.5;
		    matrix[4] = Math.sin(count / 3) * 2;
		    matrix[5] = Math.sin(count / 2);
		    matrix[6] = Math.sin(count / 4);


			if(ghost.timer >= fps * ghost.scared_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_SCATTER";
				//alarm.stop();
			}
			else nextState = ghost.state;
			break;
		case "STATE_CHASE":
			nextState = "STATE_CHASE";
			var ghostTileX = Math.floor(ghost.sprite.x / 16);
			var ghostTileY = Math.floor(ghost.sprite.y / 16);
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var playerTileX = Math.floor(player.x / 16);
			var playerTileY = Math.floor(player.y / 16);

			var last_vx = ghost.sprite.vx;
			var last_vy = ghost.sprite.vy;

		 	if( ry == 0 && rx == 0 )
		 	{
		 		var exitLeft = maze.map[ghostTileY][ghostTileX-1];
				var exitRight = maze.map[ghostTileY][ghostTileX+1];
				var exitUp = maze.map[ghostTileY-1][ghostTileX];
				var exitDown = maze.map[ghostTileY+1][ghostTileX];

				var countlr = exitLeft + exitRight;
				var countud = exitUp + exitDown;

				if((last_vx == 0 && last_vy == 0) || (countlr >= 1 && countud >= 1))
				{
					if(!(ghostTileX == playerTileX && ghostTileY == playerTileY))
					{
						var coefx = 0;
						var coefy = 0;
						if(player.vx != 0)
						{
							while(maze.map[playerTileY][playerTileX + coefx*player.vx] == 1)
							{
								coefx++;
								if(coefx == 6) break;
							}
							coefx-=2;
						}
						if( player.vy != 0)
						{
							while(maze.map[playerTileY + coefy*player.vy][playerTileX] == 1)
							{
								coefy++;
								if(coefy == 6) break;
							}
							coefy-=2;
						}
						
						if(coefx > 4) coefx = 4;
						if(coefy > 4) coefy = 4;
						if(coefx < 0) coefx = 0;
						if(coefy < 0) coefy = 0;

						bfs(ghostTileX, ghostTileY, playerTileX + coefx*player.vx, playerTileY + coefy*player.vy, function(path){
							if(path.length > 0)
							{
								var dest = path[0];
								if((dest.x - ghost.sprite.x) != 0)
									ghost.sprite.vx = dest.x - ghostTileX;
								if((dest.y - ghost.sprite.y) != 0)
									ghost.sprite.vy = dest.y - ghostTileY;

								if(ghost.sprite.vx != 0)
									ghost.sprite.vx /= Math.abs(ghost.sprite.vx);
								if(ghost.sprite.vy != 0)
									ghost.sprite.vy /= Math.abs(ghost.sprite.vy);
							}
						});
					}
					else
					{
						ghost.sprite.vx = 0;
						ghost.sprite.vy = 0;
					}
				}

				if(ghost.timer >= fps * ghost.chase_timer)
				{
					ghost.timer = 0;
					nextState = "STATE_SCATTER";
				}
			}
			break;
		default:
			nextState = "STATE_CHASE";
	}

	ghost.state = nextState;
}

function updateBlueGhost()
{
	var ghost = ghosts[2];
	var state = ghost.state;

	var last_vx = ghost.sprite.vx;
	var last_vy = ghost.sprite.vy;

	switch(state)
	{
		case "STATE_NONE":
			ghost.sprite.y = 16 * 13;
			ghost.sprite.x = 16 * 13;
			ghost.sprite.vx = 0;
			ghost.sprite.vy = 0;
			ghost.queue = [0,0,0,0];
			ghost.timer = 0;
			if(eaten_pills > (container_pill.children.length)/10)
			{
				ghost.sprite.y = 16 * 10;
				ghost.sprite.x = 16 * 13;
				nextState = "STATE_SCATTER";
			}
			else nextState = "STATE_NONE";
			break;
		case "STATE_REVIVE":
			revive(ghost, function(out) {
				ghosts[2] = out;
			});
			nextState = ghost.state;
			break;
		case "STATE_SCATTER":
			stateFrightened(ghost,function(out){
				ghosts[2] = out;
			});

			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			if(ghost.timer >= fps * ghost.scatter_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_CHASE";
			}
			else nextState = "STATE_SCATTER";
			break;
		case "STATE_FRIGHTENED":
			kill_ghost(ghost, function(out){
				ghosts[2] = out;
			});
			stateFrightened(ghost,function(out){
				ghosts[2] = out;
			});
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var matrix = filter3.matrix;

		    matrix[1] = Math.sin(count) * 3;
		    matrix[2] = Math.cos(count);
		    matrix[3] = Math.cos(count) * 1.5;
		    matrix[4] = Math.sin(count / 3) * 2;
		    matrix[5] = Math.sin(count / 2);
		    matrix[6] = Math.sin(count / 4);


			if(ghost.timer >= fps * ghost.scared_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_SCATTER";
				//alarm.stop();
			}
			else nextState = ghost.state;
			break;
		case "STATE_CHASE":
			nextState = "STATE_CHASE";
			var ghostTileX = Math.floor(ghost.sprite.x / 16);
			var ghostTileY = Math.floor(ghost.sprite.y / 16);
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var playerTileX = Math.floor(player.x / 16);
			var playerTileY = Math.floor(player.y / 16);

			var last_vx = ghost.sprite.vx;
			var last_vy = ghost.sprite.vy;

		 	if( ry == 0 && rx == 0 )
		 	{
		 		var exitLeft = maze.map[ghostTileY][ghostTileX-1];
				var exitRight = maze.map[ghostTileY][ghostTileX+1];
				var exitUp = maze.map[ghostTileY-1][ghostTileX];
				var exitDown = maze.map[ghostTileY+1][ghostTileX];

				var countlr = exitLeft + exitRight;
				var countud = exitUp + exitDown;

				if((last_vx == 0 && last_vy == 0) || (countlr >= 1 && countud >= 1))
				{
					if(!(ghostTileX == playerTileX && ghostTileY == playerTileY))
					{
						bfs(ghostTileX, ghostTileY, playerTileX, playerTileY, function(path){
							if(path.length > 0)
							{
								var dest = path[0];
								if((dest.x - ghost.sprite.x) != 0)
									ghost.sprite.vx = dest.x - ghostTileX;
								if((dest.y - ghost.sprite.y) != 0)
									ghost.sprite.vy = dest.y - ghostTileY;

								if(ghost.sprite.vx != 0)
									ghost.sprite.vx /= Math.abs(ghost.sprite.vx);
								if(ghost.sprite.vy != 0)
									ghost.sprite.vy /= Math.abs(ghost.sprite.vy);
							}
						});
					}
					else
					{
						ghost.sprite.vx = 0;
						ghost.sprite.vy = 0;
					}
				}

				if(ghost.timer >= fps * ghost.chase_timer)
				{
					ghost.timer = 0;
					nextState = "STATE_SCATTER";
				}
			}
			break;
		default:
			nextState = "STATE_CHASE";
	}

	ghost.state = nextState;
}

function updateOrangeGhost()
{
	var ghost = ghosts[3];
	var state = ghost.state;

	var last_vx = ghost.sprite.vx;
	var last_vy = ghost.sprite.vy;

	switch(state)
	{
		case "STATE_NONE":
			ghost.sprite.y = 16 * 13;
			ghost.sprite.x = 16 * 16;			
			ghost.sprite.vx = 0;
			ghost.sprite.vy = 0;
			ghost.queue = [0,0,0,0];
			ghost.timer = 0;
			if(eaten_pills > (container_pill.children.length)/5)
			{
				ghost.sprite.y = 16 * 10;
				ghost.sprite.x = 16 * 16;
				nextState = "STATE_SCATTER";
			}
			else nextState = "STATE_NONE";
			break;
		case "STATE_REVIVE":
			revive(ghost, function(out) {
				ghosts[3] = out;
			});
			nextState = ghost.state;
			break;
		case "STATE_SCATTER":
			stateFrightened(ghost,function(out){
				ghosts[3] = out;
			});

			var playerTileX = Math.floor(player.x / 16);
			var playerTileY = Math.floor(player.y / 16);

			var ghostTileX = Math.floor(ghost.sprite.x / 16);
			var ghostTileY = Math.floor(ghost.sprite.y / 16);

			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			if(rx == 0 && ry == 0)
			{
				var d = Math.sqrt((playerTileX - ghostTileX)*(playerTileX - ghostTileX) + (playerTileY-ghostTileY)*(playerTileY-ghostTileY));
				if( d > 8 )
					nextState = "STATE_CHASE";
				else nextState = "STATE_SCATTER";
			}
			else nextState = "STATE_SCATTER";

			break;
		case "STATE_FRIGHTENED":
			kill_ghost(ghost, function(out){
				ghosts[3] = out;
			});
			stateFrightened(ghost,function(out){
				ghosts[3] = out;
			});
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var matrix = filter4.matrix;

		    matrix[1] = Math.sin(count) * 3;
		    matrix[2] = Math.cos(count);
		    matrix[3] = Math.cos(count) * 1.5;
		    matrix[4] = Math.sin(count / 3) * 2;
		    matrix[5] = Math.sin(count / 2);
		    matrix[6] = Math.sin(count / 4);


			if(ghost.timer >= fps * ghost.scared_timer && rx == 0 && ry == 0 )
			{
				ghost.timer = 0;
				nextState = "STATE_SCATTER";
				//alarm.stop();
			}
			else nextState = ghost.state;
			break;
		case "STATE_CHASE":
			nextState = "STATE_CHASE";
			var ghostTileX = Math.floor(ghost.sprite.x / 16);
			var ghostTileY = Math.floor(ghost.sprite.y / 16);
			var rx = ghost.sprite.x % 16;
			var ry = ghost.sprite.y % 16;

			var playerTileX = Math.floor(player.x / 16);
			var playerTileY = Math.floor(player.y / 16);

			var last_vx = ghost.sprite.vx;
			var last_vy = ghost.sprite.vy;

			if(rx == 0 && ry == 0)
			{
				var d = Math.sqrt((playerTileX - ghostTileX)*(playerTileX - ghostTileX) + (playerTileY-ghostTileY)*(playerTileY-ghostTileY));
				if( d > 8 )
					nextState = "STATE_CHASE";
				else nextState = "STATE_SCATTER";
			}
			else nextState = "STATE_CHASE";

		 	if( ry == 0 && rx == 0 /*&& nextState == "STATE_CHASE"*/ )
		 	{
		 		var exitLeft = maze.map[ghostTileY][ghostTileX-1];
				var exitRight = maze.map[ghostTileY][ghostTileX+1];
				var exitUp = maze.map[ghostTileY-1][ghostTileX];
				var exitDown = maze.map[ghostTileY+1][ghostTileX];

				var countlr = exitLeft + exitRight;
				var countud = exitUp + exitDown;

				if((last_vx == 0 && last_vy == 0) || (countlr >= 1 && countud >= 1))
				{
					if(!(ghostTileX == playerTileX && ghostTileY == playerTileY))
					{
						bfs(ghostTileX, ghostTileY, playerTileX, playerTileY, function(path){
							if(path.length > 0)
							{
								var dest = path[0];
								if((dest.x - ghost.sprite.x) != 0)
									ghost.sprite.vx = dest.x - ghostTileX;
								if((dest.y - ghost.sprite.y) != 0)
									ghost.sprite.vy = dest.y - ghostTileY;

								if(ghost.sprite.vx != 0)
									ghost.sprite.vx /= Math.abs(ghost.sprite.vx);
								if(ghost.sprite.vy != 0)
									ghost.sprite.vy /= Math.abs(ghost.sprite.vy);
							}
						});
					}
					else
					{
						ghost.sprite.vx = 0;
						ghost.sprite.vy = 0;
					}
				}

			}
			break;
		default:
			nextState = "STATE_CHASE";
	}

	ghost.state = nextState;
}

function updatePlayer()
{
	if(player.timer > 0)
	{
		player.timer--;
		//if(player.timer==0) fundal.play();
		return;
	}

	kill_player();
	player.width = 16;
	player.height = 16;	
	var dir = player_dir;

	var playerTileX = Math.floor(player.x / 16);
	var playerTileY = Math.floor(player.y / 16);
	var rX = player.x % 16;
	var rY = player.y % 16;

	var last_vx = player.vx;
	var last_vy = player.vy;

	if( rY == 0 && rX == 0 ) {

		if( maze.map[playerTileY][playerTileX-1] == 0 || maze.map[playerTileY][playerTileX+1] == 0 )
			player.vx = 0;
		if( maze.map[playerTileY-1][playerTileX] == 0 || maze.map[playerTileY+1][playerTileX] == 0 )
			player.vy = 0;


		switch( dir )
		{
			case UP:
				if( maze.map[playerTileY-1][playerTileX] == 0 ) {
					player.vy = 0;
				}
				else
				{
					player.vy = -1;
					player.vx = 0;
				}
			break;
			case RIGHT:
				if( maze.map[playerTileY][playerTileX+1] == 0 ) {
					player.vx = 0;

				}
				else
				{
					player.vx = 1;
					player.vy = 0;
				}
			break;
			case DOWN:
				if( maze.map[playerTileY+1][playerTileX] == 0 ) {
					player.vy = 0;
				}
				else
				{
					player.vy = 1;
					player.vx = 0;
				}
			break;
			case LEFT:
				if( maze.map[playerTileY][playerTileX-1] == 0 ) {
					player.vx = 0;
				}
				else
				{ 
					player.vx = -1;
					player.vy = 0;
				}
			break;
		}
	}
	else
	{
	}
	
	for (var i = container_pill.children.length - 1; i >= 0; i--) {
			var collisionData =  hitTestRectangle(player, container_pill.children[i]);
			if(collisionData.hit && container_pill.children[i].visible == true) {
				eaten_pills ++;
				container_pill.children[i].visible=false;
				if (pills_bonus.indexOf(container_pill.children[i])!=-1)
				{
					score += 2;
					sound_bonus.play();
					alarm.play();
					for (var k = 0; k < 4; k ++)
						if (ghosts[k].state != "STATE_NONE" && ghosts[k].state != "STATE_REVIVE")
						{
							ghosts[k].state = "STATE_FRIGHTENED";
							ghosts[k].timer = 0;
						}
				}
				else {
				 score += 1;
				 sound_eat_pill.play();
				}
			}
	}

	player.x += player.vx * 4;
	player.y += player.vy * 4;

	player.width = 40;
	player.height = 70;

}

function bfs(x0, y0, xd, yd, cb)
{
    var y, i;
    var c = [];
    var p0 = {};
    p0.x = x0;
    p0.y = y0;
    var lg = [];
    var parent = [];

	for( var i = 0; i < maze.h; i++ )
	{
		parent[i] = [];
		for( var j = 0; j < maze.w; j++ )
			parent[i][j] = 0;
	}

	for( var i = 0; i < maze.h; i++ )
	{
		lg[i] = [];
		for( var j = 0; j < maze.w; j++ )
			lg[i][j] = 0;
	}

    var c = []; 
    c.push(p0);


     for( var i=0;i<maze.h;i++)
	  lg[i][0]=lg[i][maze.w-1]=-1;
	 for( var i=0;i<maze.w;i++)
	  lg[0][i]=lg[maze.h-1][i]=-1;

    var dl = [-1, 0, 1, 0];
    var dc = [ 0, 1, 0, -1];

    while( c.length > 0 )
    {
        var p = c.shift();

        for(var dir=0 ; dir < 4 ; dir++)
        {
        	var yv = p.y + dl[dir];
        	var xv = p.x + dc[dir];
        	var v = {};
        	v.x = xv;
        	v.y = yv;

            if( xv > 0 && yv > 0 && xv < maze.w && yv < maze.h && maze.map[yv][xv]==1 )
            if( lg[yv][xv]== 0)
            {
                c.push(v);

                lg[yv][xv]=lg[p.y][p.x]+1;

                parent[yv][xv] = p;

                if( xv == xd && yv == yd )
                {

                	var path = [];
                	var traverse = {};
                	traverse.x = v.x;
                	traverse.y = v.y;

                	while(traverse.x != x0 || traverse.y != y0)
                	{
                		path.push(traverse);
                		traverse = parent[traverse.y][traverse.x];
                	}

                	cb(path.reverse());
                }
            }
        }
    }
}

function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  var obj = {
  	hit : false,
  	vx : 0,
  	vy : 0	
  }
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening

  obj.vx = vx;
  obj.vy = vy;
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  obj.hit = hit;
  return obj;
};

function random(min, max)      { return Math.floor((min + (Math.random() * (max - min)))); }

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

// touchstart event binding

function touchXY(event)
{
	 var touchX = event.touches[0].pageX - (renderer.view.offsetLeft);
	 var touchY = event.touches[0].pageY - (renderer.view.offsetTop);

	 var cw = renderer.view.clientWidth;
	 var ch = renderer.view.clientHeight;

	 touchX /= (cw / 480);
	 touchY /= (ch / 640);

	 touchX -= player.x;
	 touchY -= player.y;

	 var px = 1;
	 var py = 0;

	 var dot = touchX * px + touchY * py;

	 var touch_mag = Math.sqrt(touchX*touchX + touchY*touchY);
	 var player_mag = Math.sqrt(px*px + py*py);


	 var cos_angle = dot / (touch_mag * player_mag);

	 var angle = Math.acos(cos_angle);

	 var degrees = angle * 180 / Math.PI;

	 if(touchY > 0)
	 	degrees = 360 - degrees;

	 if( degrees > 45 && degrees < 135 )
	 {
	 	player_dir = UP;
	 }
	 else if(degrees <= 315 && degrees > 225)
	 {
	 	player_dir = DOWN;
	 }

	 if(degrees <= 45 || degrees > 315)
	 {
	 	player_dir = RIGHT;
	 }
	 else if(degrees <= 225 && degrees >= 135)
	 {
	 	player_dir = LEFT;
	 }
}

//
window.addEventListener("touchstart", function(event) {
    touchXY(event)
}, false);

// touchmove event binding
window.addEventListener("touchmove", function(event) {   
    // Handle touchmove...
    touchXY(event)
}, false);
