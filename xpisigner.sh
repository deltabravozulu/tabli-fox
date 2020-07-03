#!/bin/bash
#Get an API key and secret from here: 
#https://addons.mozilla.org/en-US/developers/addon/api/key/

function begin {
	printf "Checking to see if you have web-ext in your PATH \n\n"
	sleep 1s
	if command -v web-ext &> /dev/null
	then
		printf "Found it. Let's sign and build an xpi for firefox\n\n";
		sleep 1s
		keyget
		xpiapi
	elif ! command -v web-ext &> /dev/null
		then
			printf "web-ext could not be found\n"
			printf "If you are sure you have it, check your PATH\n"
			printf "Otherwise, run npm install web-ext\n\n"
			exit
	else 
		printf "Error. Failed to check. Aborting.\n\n"
		exit
	fi
}



function keyget {
	printf "If you do not already have your your API key and secret,\n"
	printf "log in to https://addons.mozilla.org/en-US/developers/addon/api/key/\n\n"
	sleep 1s
	}

function xpiapi {
	if [ -f $CFG_FILE ]; then
		CFG_CONTENT=$(cat $CFG_FILE | sed -r '/[^=]+=[^=]+/!d' | sed -r 's/\s+=\s/=/g')
		eval "$CFG_CONTENT"
		key=$JWTIssuer
		secret=$JWTSecret
		if  [ ! -z "$JWTIssuer" ] && [ ! -z "$JWTSecret" ]; then
			printf "Configuration file ($CFG_FILE) found.\n"
			printf "You can either use this configuration file or manually input the details.\n\n"
			printf "Current configuration:\n\n"
			printf "Key:\n$key\n\n"
			printf "Secret:\n$secret\n\n"
			printf "extension source directory:\n$sourcedir\n\n"
			sleep 1s
			read -p "Would you like to use the configuration file? [Y/n] " -n 1 -e -r
			echo
			if [[ $REPLY =~ ^[Yy]$ ]]; then
				echo
				xpisign
			else
				echo
				manual
			fi
		else
			printf "Configuration file found with missing information.\nTo remedy this, simply edit the file in the same directory as this script named api_conf.txt and include lines formatted as follows:\nJWTIssuer=<key>\nJWTSecret=<secret>\n\nExample:\nJWTIssuer=user:16213231:802\nJWTSecret=a3bc892d3b9c1f7aaca1bbea488bbcd8a12312cd23cca8121bd1e32bffeaf9782393\n\nThen restart the script.\n\n"
			sleep 1s
			manual
		fi
	else
		printf "No configuration file found. You can add one to the same directory as this script.\nTo do so, simply make a file named api_conf.txt and include lines formatted as follows:\nJWTIssuer=<key>\nJWTSecret=<secret>\n\nExample:\nJWTIssuer=user:16213231:802\nJWTSecret=a3bc892d3b9c1f7aaca1bbea488bbcd8a12312cd23cca8121bd1e32bffeaf9782393\n\nThen restart the script.\n\n"
		sleep 1s
		manual


	fi
}

function manual {
	printf "Entering manual mode\n"
	sleep 1s
	read -p 'api-key (JWT Issuer): ' key
	read -p 'api-secret (JWT Secret): ' secret
	echo
	xpisign
}

function xpisign2 {
	printf "Listing key, secret, and source-dir:\n"
	echo $key
	echo $secret
	echo $sourcedir
	echo
}

function xpisign {
	printf "Signing and packing your extension into an XPI file.\n"
	web-ext sign --api-secret $secret --api-key $key --source-dir $sourcedir
	printf "\nFinished! Your extension is ready to be dragged and dropped into Firefox.\nIt has been my humblest pleasure to be of service.\n"
}

sourcedir="./tf_src"
CFG_FILE=./api_conf.txt
begin