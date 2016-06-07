<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Point
{
	function __construct($x, $y) {
		$this->x = $x;
		$this->y = $y;
	}

	public $x;
	public $y;
};

class ShapesData
{

	static $shapes;

	static function init()
	{
		$square_4_blocks = array(
		"r_0" => array(
			new Point(0,0),
			new Point(0,1),
			new Point(-1,0),
			new Point(-1,1)
			)
		);

		$stick_2_blocks = array(
			"r_0" => array(
				new Point(0,0),
				new Point(0,1),
				),
			"r_90" => array(
				new Point(0, 0),
				new Point(-1, 0)
				)
		);

		$L_4_blocks = array(
			  "r_0" => array(new Point(0, 0), new Point( 1,  0), new Point(-1,  0), new Point(-1,  1)),
			 "r_90" => array(new Point(0, 0), new Point( 0, -1), new Point( 0,  1), new Point( 1,  1)),
			"r_180" => array(new Point(0, 0), new Point(-1,  0), new Point( 1,  0), new Point( 1, -1)),
			"r_270" => array(new Point(0, 0), new Point( 0,  1), new Point( 0, -1), new Point(-1, -1))
		);

		$L_3_blocks = array(
			  "r_0" => array(new Point(0, 0), new Point(-1,  0), new Point(-1,  1)),
			 "r_90" => array(new Point(0, 0), new Point( 0,  1), new Point( 1,  1)),
			"r_180" => array(new Point(0, 0), new Point( 1,  0), new Point( 1, -1)),
			"r_270" => array(new Point(0, 0), new Point( 0, -1), new Point(-1, -1))
		);

		$J_4_blocks = array(
			  "r_0" => array(new Point(0, 0), new Point( 1,  0), new Point(-1,  0), new Point( 1,  1)),
			 "r_90" => array(new Point(0, 0), new Point( 0, -1), new Point( 0,  1), new Point( 1, -1)),
			"r_180" => array(new Point(0, 0), new Point(-1,  0), new Point( 1,  0), new Point(-1, -1)),
			"r_270" => array(new Point(0, 0), new Point( 0,  1), new Point( 0, -1), new Point(-1,  1))
		);

		$J_3_blocks = array(
			  "r_0" => array(new Point(0, 0), new Point( 1,  0), new Point( 1,  1)),
			 "r_90" => array(new Point(0, 0), new Point( 0, -1), new Point( 1, -1)),
			"r_180" => array(new Point(0, 0), new Point(-1,  0), new Point(-1, -1)),
			"r_270" => array(new Point(0, 0), new Point( 0,  1), new Point(-1,  1))
		);

		$T_4_blocks = array(
			  "r_0" => array(new Point(0, 0), new Point(0,  1), new Point(-1, 0), new Point( 1, 0)),
			 "r_90" => array(new Point(0, 0), new Point(0, -1), new Point( 0, 1), new Point( 1, 0)),
			"r_180" => array(new Point(0, 0), new Point(0, -1), new Point(-1, 0), new Point( 1, 0)),
			"r_270" => array(new Point(0, 0), new Point(0, -1), new Point( 0, 1), new Point(-1, 0))
		);

		self::$shapes = array( 
			$square_4_blocks,
			$stick_2_blocks,
			$L_4_blocks,
			$L_3_blocks,
			$J_4_blocks,
			$J_3_blocks,
			$T_4_blocks
		);

	}

}

ShapesData::init();

class Piece
{
	function __construct($type, $rot, $x, $y)
	{
		$this->pos = new Point($x, $y);
		$this->type = $type;
		$this->rot = $rot;
	}

	public $pos;
	public $type;
	public $rot;
};

class Grid
{
	function __construct()
	{
		for( $l = 0; $l < $this->h; $l++ )
		{
			$this->grid[$l] = array();
			for( $c = 0; $c < $this->w; $c++ ) {
				$this->grid[$l][$c] = 0;
			}
		}
	}

	public function AddPiece($piece)
	{
		$shapes = ShapesData::$shapes;


		//echo  $piece->rot . ' ';
		$shape = $shapes[$piece->type][$piece->rot];

		$valid = true;
		$count = 0;
		foreach( $shape as $solid )
		{
			$pos = new Point(0,0);
			$pos->x = $solid->x + $piece->pos->x;
			$pos->y = $solid->y + $piece->pos->y;

			if( $pos->x >= 0 && $pos->x < $this->w && $pos->y >= 0 && $pos->y < $this->h )
			{
				if( $this->grid[$pos->y][$pos->x] != 0 )
					$valid = false;
			}
			else
			{
				$count++;
			}
		}

		if( count($shape) > 2 && $count >= count($shape)-1 )
		{
			$valid = false;
		}

		if( $valid == true )
		{
			$count = 0;
			foreach( $shape as $solid )
			{
				$pos = new Point(0,0);
				$pos->x = $solid->x + $piece->pos->x;
				$pos->y = $solid->y + $piece->pos->y;
				
				if( $pos->x >= 0 && $pos->x < $this->w && $pos->y >= 0 && $pos->y < $this->h )
				{
					$this->grid[$pos->y][$pos->x] = self::$pieceID;
				}
				
			}
			self::$pieceID++;
		}
	}

	public function UpdatePiece($piece)
	{
		$shapes = ShapesData::$shapes;
		// check projection on grid for collision
		$collision = false;

		while( $collision == false )
		{
			$shape = $shapes[$piece->type][$piece->rot];

			$collision = false;

			foreach($shape as $solid) {
				$pos = new Point(0, 0);
				$pos->x = $solid->x + $piece->pos->x;
				$pos->y = $solid->y + $piece->pos->y;

				if( $pos->x < 0 || ($pos->x >= 0 && $pos->y >= 0 && $pos->x < $this->w && $pos->y < $this->h && $this->grid[$pos->y][$pos->x] != 0) ){
					$piece->pos->x++;
					$collision = true;
				}
			}
			if( $collision == false )
			{
				$piece->pos->x--;
			}

		}
		$this->AddPiece($piece);
	}

	public function nextPieceID() {
		$tmp = self::$pieceID;
		self::$pieceID++;
		return $tmp;
	}

	public $grid = array();
	public $w = 5;
	public $h = 9;
	static $pieceID = 10;
};

class Maze extends Model
{
    //
    function __construct($level) {
    	parent::__construct();

    	$this->width = 30;
    	$this->height = 30;

		for( $l = 0; $l < $this->height; $l++ )
		{
			$this->map[$l] = array();
			for( $c = 0; $c < $this->width; $c++ ) {
				$this->map[$l][$c] = 0;
			}
		}

		$this->Generate();

		for( $x = 0; $x < 15; $x++)
		{
			for( $y = 0; $y < 27; $y++)
			{
				$mapx = floor($x/3);
				$mapy = floor($y/3);

				//var value = tetris.grid[mapy][mapx];
				$value = $this->grid->grid[$mapy][$mapx];

				$this->map[($y+2)][($x + 2 + 12)] = $value;

				if( $value != 10 )
					$this->map[($y+2)][(15-$x+2-1)] = $value;
				else $this->map[($y+2)][(15-$x+2-1)] = $value;
			}
		}

		// delta x
		for( $x = 0; $x < $this->width; $x++ )
		{
			for( $y = 0; $y < $this->height; $y++ )
			{
				if( $x > 0 && $this->map[$y][($x-1)] != $this->map[$y][$x] )
				{
					$this->map[$y][($x-1)] = 99;
				}
			}
		}

		// delta y
		for( $x = 0; $x < $this->width; $x++ )
		{
			for( $y = 0; $y < $this->height; $y++ )
			{
				if( $y > 0 && $this->map[$y-1][$x] != $this->map[$y][$x] )
				{
					$this->map[$y-1][$x] = 99;
				}
			}
		}

		
		for( $x = 0; $x < $this->width; $x++ )
		{
			for( $y = 0; $y < $this->height; $y++ )
			{
				if( $this->map[$y][$x] < 99 )
					$this->map[$y][$x] = 0x0;
				else if( $this->map[$y][$x] == 0 )
					$this->map[$y][$x] = 0x0; 
				else $this->map[$y][$x] = 0x1;
			}
		}

//		if($level )

		$num_deadend = 0;

		if($level == 1)
			$num_deadend = 0;
		else if($level < 4)
			$num_deadend = 1;
		else if($level < 6)
			$num_deadend = 2;
		else $num_deadend = 10;

		for( $yy = 0; $yy < ($this->height-2)*16 && $num_deadend > 0; $yy+=16)
		{
			for( $xx = 0; $xx < ($this->width-1)*16 && $num_deadend > 0; $xx+=16)
			{
				$y = $yy / 16;
				$x = $xx / 16;

				if($y < 10 || $y > 21 || $x < 10 || $x > 20)
				if($x >= 1 && $y < $this->height-1 && $y >= 1 && $x < $this->width-1 &&(rand(0, 100) < 10*$level))
				if( $this->map[$y][$x] == 1 && $this->map[$y][$x+1] == 0 && $this->map[$y][$x-1] == 0 &&
					(($this->map[$y+1][$x] == 1 && $this->map[$y+1][$x+1] == 0 && $this->map[$y+1][$x-1] == 0 &&
					($this->map[$y-1][$x] == 1 && $this->map[$y-1][$x+1] == 1 && $this->map[$y-1][$x-1] == 1 || 
					$this->map[$y-1][$x] == 1 && $this->map[$y-1][$x+1] == 0 && $this->map[$y-1][$x-1] == 1) ||
					$this->map[$y-1][$x] == 1 && $this->map[$y-1][$x+1] == 1 && $this->map[$y-1][$x-1] == 0) ))
					
				{
					$this->map[$y][$x] = 0;
					$this->map[$y+1][$x] = 0;
					$num_deadend--;
					$yy+= 64-16;
					break;
				}
			}
		}

    }

    private function Generate() {

    	$shapes = ShapesData::$shapes;
    	
    	$grid = new Grid();
    	$rot = "r_0";
    	$startPiece = new Piece(0,$rot,1,3);
    	$grid->AddPiece($startPiece);


    	$shapesLen = count($shapes);

    	for( $it = 0; $it < $grid->w; $it++ )
    	{
    		$arrPieces = array();
    		for( $i = 0; $i < $grid->h; $i++ )
    		{
    			$rand = 0;
    			if( $it > 0 )
    				$rand = rand(2, $shapesLen-1);
    			else
    				$rand = rand(2, $shapesLen-1);

    			$rotcount = count($shapes[$rand]);

    			$randrot = rand(0, $rotcount-1);

    			$finalrot = "r_0";
    			$contor = 0;

    			foreach( $shapes[$rand] as $key=>$rot )
    			{
    				$finalrot = $key;
    				if( $contor == $randrot )
    					break;
    				$contor++;
    			}

    			$cpiece = new Piece($rand, $finalrot, $grid->w + 4, $i);
    			array_push($arrPieces, $cpiece);
    		}
    		foreach( $arrPieces as $piece )
	    	{
	    		$grid->UpdatePiece($piece);
	    	} 
    	}

    	for( $i = 0; $i < $grid->h; $i++ ) {
    		for( $j = $grid->w; $j > 0; $j-- ) {
    			for( $p = $shapesLen-1; $p >= 1; $p--) {
    				foreach( $shapes[$p] as $key => $shape ) {
    					$cpiece = new Piece($p, $key, $j, $i);
    					$grid->AddPiece($cpiece);
    				}
    			}
    		}
    	}

    	for( $i = $grid->h-1; $i >= 0; $i--) {
    		for( $j = $grid->w; $j > 0; $j-- ) {
    			for( $p = $shapesLen-1; $p >= 1; $p--) {
    				foreach( $shapes[$p] as $key => $shape ) {
    					$cpiece = new Piece($p, $key, $j, $i);
    					$grid->AddPiece($cpiece);
    				}
    			}
    		}
    	}

    	for( $i = $grid->h-1; $i >= 0; $i--) {
    		for( $j = $grid->w; $j > 0; $j-- ) {
    			for( $p = 1; $p < $shapesLen; $p ++) {
    				foreach( $shapes[$p] as $key => $shape ) {
    					$cpiece = new Piece($p, $key, $j, $i);
    					$grid->AddPiece($cpiece);
    				}
    			}
    		}
    	}

    	for( $i = 0; $i < $grid->h; $i++ ) {
    		for( $j = $grid->w-1; $j > 0; $j-- ) {
    			if( $grid->grid[$i][$j] == 0 ) {
    				$grid->grid[$i][$j] = $grid->nextPieceID();
    			}
    		}
    	}

    	$this->grid = $grid;
    
    }

    public $height = 30;
    public $width = 30;
    public $map = array();
    private $grid;
};
