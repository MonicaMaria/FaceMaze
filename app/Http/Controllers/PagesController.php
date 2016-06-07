<?php

namespace App\Http\Controllers;

use DB;

use Auth;

use Illuminate\Support\Facades\Redirect;

use Session;

use Illuminate\Http\Request;

use App\Http\Requests;

use App\User;

use Socialite;

use Abraham\TwitterOAuth\TwitterOAuth;

use Input;

// use Psr\Http\Message\ServerRequestInterface;


require_once(app_path().'\..\vendor\j7mbo\twitter-api-php\TwitterAPIExchange.php');


class PagesController extends Controller
{
    public function home() {

    	$ot = Input::get('oauth_token');
    	$ov = Input::get('oauth_verifier');

    	//echo $ot," ",$ov,"<br><br>";

    	// twitter login
    	if(!empty($ot)&&!empty($ov))
    	{
    		$oauthStuffs = array(
				'oauth_consumer_key' => "JmJMqrxGQv3yN9sa9zcJL4sIl",
				'oauth_nonce' => base64_encode(openssl_random_pseudo_bytes(32)),
				'oauth_signature_method' => 'HMAC-SHA1',
				'oauth_timestamp' => time(),
				'oauth_token' => $ot,
				'oauth_version' => '1.0'
			);

			ksort($oauthStuffs);

			$method = 'POST';

			$baseUrl = 'https://api.twitter.com/oauth/access_token';

			$outputString = '';

			$i = 0;
			foreach($oauthStuffs as $key => $value){
			    $outputString.= rawurlencode($key).'='.rawurlencode($value);
			    $i++;

			    if($i < count($oauthStuffs)) $outputString .='&';
			}


			$baseString = $method.'&'.rawurlencode($baseUrl).'&'.rawurlencode($outputString);

			$consumerSecret = "HE7m3PUsKJoTEEA2y0sTzIILWDLnfxoY3ZrEexq0mwaSO5SlnQ";

			$signingKey = rawurlencode($consumerSecret).'&';

			$signature = base64_encode(hash_hmac('sha1', $baseString , $signingKey, true));

			$oauthStuffs['oauth_signature']=$signature;

			ksort($oauthStuffs);

			$headerString = "Authorization: OAuth ";
			$i = 0;
			foreach($oauthStuffs as $key => $value){
			    $headerString .= rawurlencode($key).'="'.rawurlencode($value).'"';
			    $i++;
			    if($i < count($oauthStuffs)) $headerString .= ", ";
			}


			$ch = curl_init();
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_URL, $baseUrl);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array($headerString));

			$postFields = array(
			    'oauth_verifier' => $ov
			);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);


			$response = curl_exec($ch);
			//oauth_token=nFVBPgAAAAAAu0_mAAABVPQADeo&oauth_token_secret=6MXtpkLi4UQVNZJUktGE4W7ofaW6L23r&oauth_callback_confirmed=true
			$arr = explode("&", $response);
			$arr[0] = substr($arr[0], strlen("oauth_token="));
			$arr[1] = substr($arr[1], strlen("oauth_token_secret="));
			
			//echo "<br>token : ",$arr[0], "<br> secret : ", $arr[1];
			Session::set('tw_oauth_token', $arr[0]);
			Session::set('tw_oauth_token_secret', $arr[1]);
    	}


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

    	if ($fb_status == TRUE && $tw_status == TRUE) {
			return Redirect::away('mainpage');
		}
		else return view('index', [ 'fb_status' => $fb_status, 'tw_status' => $tw_status ]);
	}
	
	 public function logout() {
		Session::flush();
		Auth::logout();
		return redirect('/');
	}
	
	public function profile() {
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

    	if ($fb_status == TRUE && $tw_status == TRUE) {
    		$error = Session::pull('error_email', "0");
			return view('profile', [ 'error' => $error ]);
		}
		else return Redirect::away('/');
	}

	public function update(Request $request ) {
		$name = $request->input("name");
		$email = $request->input("email");
		if(!empty($email)){
			if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  				//$_SESSION['emailErr'] = "Invalid email format";
  				Session::put('error_email', "Invalid email format");
			}
			else{
				DB::table('users')
	            	->where('facebook_id', Auth::user()->facebook_id)
	            	->update(array('email' => $email));
	        }
	    }
	    if(!empty($name)){
			DB::table('users')
	            ->where('facebook_id', Auth::user()->facebook_id)
	            ->update(array('name' => $name));
	    }
	    return Redirect::away("profile");
	}
	
	public function mainpage() {
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

		if ($fb_status == TRUE && $tw_status == TRUE) {
			return view('mainpage');
		}
		else return Redirect::away('/');//view('index', [ 'fb_status' => $fb_status, 'tw_status' => $tw_status ]);
	}
	
	public function game() {
		// not needed - ! can remove?
		$token = Session::get('tw_oauth_token');
		$token_secret = Session::get('tw_oauth_token_secret');
    	$fb_status = Auth::check();
    	$tw_status = (!empty($token) && !empty($token_secret));

		if ($fb_status == TRUE && $tw_status == TRUE) {
			return view('game');
		}
		else return Redirect::away('/');
	}
	
	public function scores() {
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

		if ($fb_status == TRUE && $tw_status == TRUE) {
			$jucatori = DB::table('users')
							->orderBy('score','desc')
							->take(10)
							->get();
			return view('scores', compact('jucatori'));
		}
		else return Redirect::away('/');
	}
	
	public function login() {

		$oauthStuffs = array(
			'oauth_consumer_key' => "JmJMqrxGQv3yN9sa9zcJL4sIl",
			'oauth_nonce' => base64_encode(openssl_random_pseudo_bytes(32)),
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_version' => '1.0',
			'oauth_callback' => 'http://localhost:8000/'
		);

		ksort($oauthStuffs);

		$method = 'POST';

		$baseUrl = 'https://api.twitter.com/oauth/request_token';

		$outputString = '';

		$i = 0;
		foreach($oauthStuffs as $key => $value){
		    $outputString.= rawurlencode($key).'='.rawurlencode($value);
		    $i++;

		    if($i < count($oauthStuffs)) $outputString .='&';
		}


		$baseString = $method.'&'.rawurlencode($baseUrl).'&'.rawurlencode($outputString);

		$consumerSecret = "HE7m3PUsKJoTEEA2y0sTzIILWDLnfxoY3ZrEexq0mwaSO5SlnQ";

		$signingKey = rawurlencode($consumerSecret).'&';

		$signature = base64_encode(hash_hmac('sha1', $baseString , $signingKey, true));

		$oauthStuffs['oauth_signature']=$signature;

		ksort($oauthStuffs);

		$headerString = "Authorization: OAuth ";
		$i = 0;
		foreach($oauthStuffs as $key => $value){
		    $headerString .= rawurlencode($key).'="'.rawurlencode($value).'"';
		    $i++;
		    if($i < count($oauthStuffs)) $headerString .= ", ";
		}

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $baseUrl);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array($headerString));

		$postFields = array(
		    'oauth_callback' => rawurlencode('http://localhost:8000/')
		);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);


		$response = curl_exec($ch);
		//oauth_token=nFVBPgAAAAAAu0_mAAABVPQADeo&oauth_token_secret=6MXtpkLi4UQVNZJUktGE4W7ofaW6L23r&oauth_callback_confirmed=true
		$response = substr($response, strlen("oauth_token="));
		$p = strpos($response, "oauth_token_secret=");
		$response = substr($response, 0, $p);
		echo $response;

		//REDIRECTING TO THE URL
		return Redirect::away('https://api.twitter.com/oauth/authenticate?oauth_token='.$response);
	}	
}
