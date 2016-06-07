<?php

namespace App\Http\Controllers;

use App\Maze;
use Socialite;
use Illuminate\Http\Request;
use App\Http\Requests;
use Session;
use Auth;
use Redirect;
use DB;

class GameController extends Controller
{
    public function game() {

      $token = Session::get('tw_oauth_token');
      $token_secret = Session::get('tw_oauth_token_secret');
      $fb_status = Auth::check();
      $tw_status = (!empty($token) && !empty($token_secret));

      $fb_token = Session::get('fb_token');
      if(empty($fb_token))
      {
        $fb_status = FALSE;
        Auth::logout();
      }

      if ($fb_status == FALSE || $tw_status == FALSE) {
          return Redirect::away('/');
      }

      return view('game');
	 }

}
