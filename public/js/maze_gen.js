function random(min, max)      { return (min + (Math.random() * (max - min)));            }
function randomChoice(choices) { return choices[Math.round(random(0, choices.length-1))]; }

function Point(posx, posy) {
	this.x = posx;
	this.y = posy;
}


//relative offsets
var shapes =
[
	/*
	   | | | | |
	   | |X|O| |
	   | |X|X| |
	   | | | | |
	*/
	{
		name : "square_4_blocks",
		rotations : {
			r_0 : [new Point(0, 0), new Point(0, 1), new Point(-1, 0), new Point(-1, 1)]
		}
	},
	/*
	r_90:  | | | | |   r_0: | | | | |
	   	   | |X|O| |        | | |O| |
	       | | | | |        | | |X| |
	       | | | | |        | | | | |
	*/
	{
		name: "stick_2_blocks",
		rotations : {
			r_0 : [new Point(0, 0), new Point(0, 1)],
			r_90 : [new Point(0, 0), new Point(-1, 0)]
		}
	},
	/*
	r_0:  | | | | |  r_90: | | |X| |
	   	  | |X|O|X|        | | |O| |
	      | |X| | |        | | |X|X|
	      | | | | |        | | | | |

   r180:  | | | |X|  r270: | |X|X| |
	   	  | |X|O|X|        | | |O| |
	      | | | | |        | | |X| |
	      | | | | |        | | | | |
	*/
	{
		name: "L_4_blocks",
		rotations : {
			  r_0 : [new Point(0, 0), new Point( 1,  0), new Point(-1,  0), new Point(-1,  1)],
			 r_90 : [new Point(0, 0), new Point( 0, -1), new Point( 0,  1), new Point( 1,  1)],
			r_180 : [new Point(0, 0), new Point(-1,  0), new Point( 1,  0), new Point( 1, -1)],
			r_270 : [new Point(0, 0), new Point( 0,  1), new Point( 0, -1), new Point(-1, -1)]
		}
	},
	/*
	r_0:  | | | | |  r_90: | | | | |
	   	  | |X|O| |        | | |O| |
	      | |X| | |        | | |X|X|
	      | | | | |        | | | | |

   r180:  | | | |X|  r270: | |X|X| |
	   	  | | |O|X|        | | |O| |
	      | | | | |        | | | | |
	      | | | | |        | | | | |
	*/
	{
		name: "L_3_blocks",
		rotations : {
			  r_0 : [new Point(0, 0), new Point(-1,  0), new Point(-1,  1)],
			 r_90 : [new Point(0, 0), new Point( 0,  1), new Point( 1,  1)],
			r_180 : [new Point(0, 0), new Point( 1,  0), new Point( 1, -1)],
			r_270 : [new Point(0, 0), new Point( 0, -1), new Point(-1, -1)]
		}
	},
	/*
	r_0:  | | | | |  r_90: | | |X|X|
	   	  | |X|O|X|        | | |O| |
	      | | | |X|        | | |X| |
	      | | | | |        | | | | |

   r180:  | |X| | |  r270: | | |X| |
	   	  | |X|O|X|        | | |O| |
	      | | | | |        | |X|X| |
	      | | | | |        | | | | |
	*/
	{
		name: "J_4_blocks",
		rotations : {
			  r_0 : [new Point(0, 0), new Point( 1,  0), new Point(-1,  0), new Point( 1,  1)],
			 r_90 : [new Point(0, 0), new Point( 0, -1), new Point( 0,  1), new Point( 1, -1)],
			r_180 : [new Point(0, 0), new Point(-1,  0), new Point( 1,  0), new Point(-1, -1)],
			r_270 : [new Point(0, 0), new Point( 0,  1), new Point( 0, -1), new Point(-1,  1)]
		}
	},
	/*
	r_0:  | | | | |  r_90: | | |X|X|
	   	  | | |O|X|        | | |O| |
	      | | | |X|        | | | | |
	      | | | | |        | | | | |

   r180:  | |X| | |  r270: | | | | |
	   	  | |X|O| |        | | |O| |
	      | | | | |        | |X|X| |
	      | | | | |        | | | | |
	*/
	{
		name: "J_3_blocks",
		rotations : {
			  r_0 : [new Point(0, 0), new Point( 1,  0), new Point( 1,  1)],
			 r_90 : [new Point(0, 0), new Point( 0, -1), new Point( 1, -1)],
			r_180 : [new Point(0, 0), new Point(-1,  0), new Point(-1, -1)],
			r_270 : [new Point(0, 0), new Point( 0,  1), new Point(-1,  1)]
		}
	},
	/*
	r_0:  | | | | |  r_90: | | |X| |
	   	  | |X|O|X|        | | |O|X|
	      | | |X| |        | | |X| |
	      | | | | |        | | | | |

   r180:  | | |X| |  r270: | | |X| |
	   	  | |X|O|X|        | |X|O| |
	      | | | | |        | | |X| |
	      | | | | |        | | | | |
	*/
	{
		name: "T_4_blocks",
		rotations : {
			  r_0 : [new Point(0, 0), new Point(0,  1), new Point(-1, 0), new Point( 1, 0)],
			 r_90 : [new Point(0, 0), new Point(0, -1), new Point( 0, 1), new Point( 1, 0)],
			r_180 : [new Point(0, 0), new Point(0, -1), new Point(-1, 0), new Point( 1, 0)],
			r_270 : [new Point(0, 0), new Point(0, -1), new Point( 0, 1), new Point(-1, 0)]
		}
	}
];

var pieceNames = {
	square_4_blocks : 0,
	stick_2_blocks : 1,
	L_4_blocks : 2,
	L_3_blocks : 3,
	J_4_blocks : 4,
	J_3_blocks : 5,
	T_4_blocks : 6
}

var rotations = [ "r_0", "r_90", "r_180", "r_270" ];
var rotvalues = {
	"r_0" : 0,
	"r_90" : 1,
	"r_180" : 2,
	"r_270" : 3
}

function Piece(type, rot, x, y)
{
	this.Position = new Point(x,y);
	this.type = type;
	this.w = 4;
	this.h = 4;
	this.Center = new Point(2,1);
	this.Rotation = rot;
}

var showGrid = function( grid, w, h ) {
					for( var i = 0; i < h; i++ )
					{
						var str = "|";
						for( var j = 0; j < w; j++ )
						{
							if( grid[i][j] < 10 )
							{
								str += " ";
							}
							str += grid[i][j];
							str += "|";
						}
						console.log(str);
					}
				}


var pieceID = 10;

function Grid(w, h)
{
	this.grid = [];
	this.w = w;
	this.h = h;
	var root = this;

	for( var i = 0; i < h; i++ )
	{
		this.grid[i] = [];
		for( var j = 0; j < w; j++ )
			this.grid[i][j] = 0;
	}

	this.AddPiece = function(piece) {

		var pos = piece.Position;
		var shape = shapes[piece.type].rotations[piece.Rotation];

		if( !shape )
			return;

		var valid = true;
		var count = 0;
		for( var cell = 0; cell < shape.length && valid == true; cell++ ){
			var offset = shape[cell];
			var pos = new Point(0, 0);
			pos.x = offset.x + piece.Position.x;
			pos.y = offset.y + piece.Position.y;

			if( pos.x >= 0 && pos.x < root.w && pos.y >= 0 && pos.y < root.h )
			{
				if( root.grid[pos.y][pos.x] != 0 )
					valid = false;
			}
			else
			{
				count++;
			}
		}
		if( shape.length > 2 && count >= shape.length-1 )
		{
			valid = false;
		}

		if( valid == true )
		{
			if( piece.type == 1 ) 
				console.log( piece.Rotation, piece.Position.y, piece.Position.x);

			for( var cell = 0; cell < shape.length; cell++ ){
				var offset = shape[cell];
				var pos = new Point(0, 0);
				pos.x = offset.x + piece.Position.x;
				pos.y = offset.y + piece.Position.y;

				if( pos.x >= 0 && pos.x < root.w && pos.y >= 0 && pos.y < root.h )
				{
					root.grid[pos.y][pos.x] = pieceID;
				}
			}
			pieceID++;
		}
		

	}

	this.UpdatePiece = function(piece) {

		// check projection on grid for collision
		var collision = false;

		if( !piece )
			return;

		while( collision == false )
		{
			var shape = shapes[piece.type].rotations[piece.Rotation];

			if( !shape ) {
				console.log(piece.type);
				console.log(piece.Rotation);
			}

			//console.log(JSON.stringify(shapes[piece.type], null, 4));
			collision = false;

			for(var cell = 0; cell < shape.length && collision == false; cell++) {
				var offset = shape[cell];
				var pos = new Point(0, 0);
				pos.x = offset.x + piece.Position.x;
				pos.y = offset.y + piece.Position.y;

				if( pos.x < 0 || (pos.x >= 0 && pos.y >= 0 && pos.x < root.w && pos.y < root.h && root.grid[pos.y][pos.x] != 0) ){
					piece.Position.x++;
					collision = true;
				}
			}

			if( collision == false )
			{
				piece.Position.x--;
			}

			//showGrid(root.grid, 5, 9);
			//root.Show();
			//console.log("_____________________");
		}
		this.AddPiece(piece);
	}

}

function TetrisGrid()
{
	var grid = new Grid(5, 9);

	var name = 0;
	var rot = "r_0";

	var startPiece = new Piece( 0, rot, 1, 3);

	grid.AddPiece(startPiece);


	for( var it = 0; it < grid.w; it++ )
	{
		var arrPieces = [];
		for( var i = 0; i < grid.h; i++ )
		{
			var rand = 0;
			if( it > 0 )
				rand = random(0, shapes.length);
			else
				rand = random(2, shapes.length);

			rand = Math.floor(rand);

			var randrot = random(0, Object.keys(shapes[rand].rotations).length);
			randrot = Math.floor(randrot);

			var cpiece = new Piece(rand, rotations[randrot], grid.w + 4, i);
			
			arrPieces.push(cpiece);
		}
		for( var p = 0; p < arrPieces.length; p++ )
		{
			grid.UpdatePiece(arrPieces[p]);
		}
	}

	// fill best fitting shapes
	console.log("fill");
	for( var i = 0; i < grid.h; i++ )
	{
		for( var j = grid.w-1; j > 0; j-- )
		{
			for( var p = shapes.length-1; p >= 0; p-- ) {

				for( var rot in shapes[p].rotations ) {
					var cpiece = new Piece(p, rot, j, i);
					grid.AddPiece(cpiece);
				}

			}

		}
	}

	console.log("whatever");
	// fill whatever
	for( var i = grid.h-1; i >= 0; i-- )
	{
		for( var j = grid.w-1; j > 0; j-- )
		{
			for( var p = shapes.length-1; p >= 0; p-- ) {

				for( var rot in shapes[p].rotations ) {
					var cpiece = new Piece(p, rot, j, i);
					grid.AddPiece(cpiece);
				}
				
			}
		}
	}

	// fill the rest
	for( var i = 1; i < grid.h-1; i++ )
	{
		for( var j = 0; j < grid.w-1; j++ )
		{
			if( grid.grid[i][j] == 0 )
			{
				grid.grid[i][j] = pieceID;
				pieceID++;
			}
				
		}
	}

    return grid;
}

function Maze() {

	this.w = 30;
	this.h = 30;
	this.map = [];
	var root = this;

	for( var i = 0; i < this.h; i++ )
	{
		this.map[i] = [];
		for( var j = 0; j < this.w; j++ )
			this.map[i][j] = 0;
	}

	this.Generate = function() {
		var tetris = TetrisGrid();

		console.log(tetris.grid);

		for( var x = 0; x < 15; x++)
		{
			for( var y = 0; y < 27; y++)
			{
				var mapx = Math.floor(x/3);
				var mapy = Math.floor(y/3);

				var value = tetris.grid[mapy][mapx];

				//if( (mapx % 3 == 2) || (mapy % 3 == 2) )
				//	value = " w";

				root.map[y+2][x + 2 + 12] = value;

				if( value != 10 )
					root.map[y+2][15-x+2-1] = value;
				else root.map[y+2][15-x+2-1] = value;
			}
		}

		// delta x
		for( var x = 0; x < this.w; x++ )
		{
			for( var y = 0; y < this.h; y++ )
			{
				if( x > 0 && root.map[y][x-1] != root.map[y][x] )
					root.map[y][x-1] = 99;
			}
		}

		// delta y
		for( var x = 0; x < this.w; x++ )
		{
			for( var y = 0; y < this.h; y++ )
			{
				if( y > 0 && root.map[y-1][x] != root.map[y][x] )
					root.map[y-1][x] = 99;
			}
		}

		
		for( var x = 0; x < this.w; x++ )
		{
			for( var y = 0; y < this.h; y++ )
			{
				if( root.map[y][x] < 99 )
					root.map[y][x] = 0x0;
				else if( root.map[y][x] == 0 )
					root.map[y][x] = 0x0;
				else root.map[y][x] = 0x1;
			}
		}

		showGrid(root.map, root.w, root.h);
		// extend matrix

	}
}

var maze = new Maze();
maze.Generate();