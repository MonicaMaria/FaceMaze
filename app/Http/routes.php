<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

use App\Maze;


Route::get('/', 'PagesController@home');
Route::get('logout', 'PagesController@logout');

Route::get('auth/facebook', 'Auth\AuthController@redirectToProvider');
Route::get('auth/facebook/callback', 'Auth\AuthController@handleProviderCallback');

Route::get('home', array('as' => 'home', 'uses' => function(){
  return redirect('/');
}));

Route::post('update', 'PagesController@update' );

Route::get('profile', 'PagesController@profile');

Route::get('twitter', 'PagesController@login');

Route::get('game', 'GameController@game');

Route::get('mainpage', 'PagesController@mainpage');

Route::get('scores', 'PagesController@scores');

Route::post('gametweet', function()
{
	if(Request::ajax()) {
        $data = Input::all();
      
		$ot = Session::get('tw_oauth_token');
		$ots = Session::get('tw_oauth_token_secret');

		$settings = array(
		    'oauth_access_token' => $ot,
		    'oauth_access_token_secret' => $ots,
		    'consumer_key' => "JmJMqrxGQv3yN9sa9zcJL4sIl",
		    'consumer_secret' => "HE7m3PUsKJoTEEA2y0sTzIILWDLnfxoY3ZrEexq0mwaSO5SlnQ"
		);

		$name = $data['name'];
		$name = strtolower($name);
		$name_arr = explode(" ", $name);

		$cursor = '-1';
		$found = FALSE;
		do {
			$url = 'https://api.twitter.com/1.1/friends/list.json';
			$getfield = '?cursor=' . $cursor . '&skip_status=true&include_user_entities=false';
			$requestMethod = 'GET';

			$twitter = new TwitterAPIExchange($settings);
			$result=$twitter->setGetfield($getfield)
					->buildOauth($url, $requestMethod)
	    	        ->performRequest();
	    	$followers=json_decode($result);
	    	if(array_key_exists("errors", $followers))
	    		Log::info('decoded json'. $result);
	    	//Log::info('decoded json'. $result);
	    	$users = $followers->{'users'};
	    	$cursor = $followers->{'next_cursor_str'};
	    	foreach ($users as $user) {
	    		$username = strtolower($user->{'name'});
	    		$tmp = explode(" ", $username);
	    		$matches = 0;
	    		foreach($name_arr as $name_fb) {
	    			foreach ($tmp as $name_tw) {
	    				//Log::info($name_tw. ' ' . $name_fb);
	    				if(strcmp($name_fb, $name_tw) == 0) {
	    					$matches++;
	    				}
	    			}
	    		}
	    		if($matches >= 2){
	    			$screenname = $user->{'screen_name'};
	    			$found = TRUE;
	    			break;
	    		}
	    	}
		}
	    while($cursor!='0' && $found==FALSE);

	    if( $found == FALSE ) {
			$cursor = '-1';
			$found = FALSE;
			do{
				$url = 'https://api.twitter.com/1.1/followers/list.json';
				$getfield = '?cursor=' . $cursor . '&skip_status=true&include_user_entities=false';
				$requestMethod = 'GET';

				$twitter = new TwitterAPIExchange($settings);
				$result=$twitter->setGetfield($getfield)
						->buildOauth($url, $requestMethod)
		    	        ->performRequest();
		    	$followers=json_decode($result);
		    	if(array_key_exists("errors", $followers))
	    			Log::info('decoded json'. $result);
		    	$users = $followers->{'users'};
		    	$cursor = $followers->{'next_cursor_str'};
		    	foreach ($users as $user) {
		    		$username = strtolower($user->{'name'});
		    		$tmp = explode(" ", $username);
		    		$matches = 0;
		    		foreach($name_arr as $name_fb) {
		    			foreach ($tmp as $name_tw) {
		    				if(strcmp($name_fb, $name_tw) == 0) {
		    					$matches++;
		    				}
		    			}
		    		}
		    		if($matches >= 2){
		    			$screenname = $user->{'screen_name'};
		    			$found = TRUE;
		    			break;
		    		}
		    	}
			}
		    while($cursor!='0' && $found==FALSE);
		}

		$url = 'https://api.twitter.com/1.1/statuses/update.json'; 
		$requestMethod = 'POST';
    	
		//Log::info($screenname);
    	if($found==TRUE) $postfields = array('status' => 'Jucand #FaceMaze am fost inghitit de @'. $screenname);
		else $postfields = array('status' => 'Jucand #FaceMaze am fost inghitit de ' . ($data['name'])); 

		$twitter = new TwitterAPIExchange($settings);
		$response = $twitter->buildOauth($url, $requestMethod)
			       		  	->setPostfields($postfields)
			        		->performRequest();
		return "succes";
	}
	return "error";
});

Route::post('loadgame', function(){
	if(Request::ajax()) {
		$data = Input::all();

		$level = $data['level'];
		$score = $data['score']*10;
		$lives = $data['lives'];

		if($lives == 0){
			DB::table('users')
              ->where('facebook_id', Auth::user()->facebook_id)
              ->update(array('last_score' => $score));

            DB::table('users')
              ->where('facebook_id', Auth::user()->facebook_id)
              ->where('score','<',$score)
              ->update(array('score' => $score));

            $out = array( "gameover" => $score );	
			$outjson = json_encode($out);
			return $outjson;
		}

		$maze = new Maze($level);
		$width = $maze->width;
		$height = $maze->height;
		$map = $maze->map;

		$maze_object = array( "w" => $width, "h" => $height, "map" => $map);

		$player_image = Auth::user()->avatar;

		$token = Session::get('fb_token');
		$fb = new \Facebook\Facebook([
			'app_id' => "257648657912979", // Replace {app-id} with your app id
			'app_secret' => "3aef6aa9b2da3f9039b40c4885a9b663",
			'default_graph_version' => 'v2.6',
		]);

		$response = $fb->get('/me/friends?limit=2000', $token);
		$responsejson = json_decode($response->getBody());
		$graphObject_friends = $responsejson->{'data'};
		$count_friends = count($graphObject_friends);

		$response = $fb->get('/me/invitable_friends?limit=2000', $token);
		$responsejson = json_decode($response->getBody());
		$graphObject = $responsejson->{'data'};
		$count_invitable = count($graphObject);

		$max_index = $count_invitable + $count_friends;
		$friends = array();
		for($it = 1; $it <= 4; $it++) {
			$index = rand(0,$max_index-1);

			if( $index < $count_friends )
			{
				$friend_id = $graphObject_friends[$index]->{'id'};
				$strtmp = '/'.$friend_id.'/picture?redirect=false';
				$responsepic = $fb->get($strtmp, $token);
				$picturejson = json_decode($responsepic->getBody());
				$friends[] = array("name" => $graphObject_friends[$index]->{'name'}, "url" => $picturejson->{'data'}->{'url'} );
			}
			else
			{
				$index -= $count_friends;
				$value = $graphObject[$index];
				$picture = $value->{'picture'}->{'data'};
				$friends[] = array("name" => $value->{'name'}, "url" => $picture->{'url'});
			}
		}

		$out = array( "maze" => $maze_object, "player_image" => $player_image, "friends" => $friends);
		
		$outjson = json_encode($out);

		return $outjson;
	}
	else return "error";
});
