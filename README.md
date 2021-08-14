# dockiera-app

## Set up
<ol>
  <li>git clone https://github.com/agh-docker-monitoring/dockiera-app</li>
  <li>Copy file .env-example</li>
  <li>Change its name to .env</li>
  <li>Change mock variables to your own. TOKEN can be a random sequence of char, you can use this https://randomkeygen.com/</li>
  <li>Save .env</li>
  <li>docker-compose -f docker-compose-prod.yml build to build images</li>
  <li>docker-compose -f docker-compose-prod.yml up to run application</li>
  <li>Application should be available at localhost:3000</li>
  
</ol>


## DEV set up
<ol>
  <li>Copy file .env-example</li>
  <li>Change its name to .env</li>
  <li>Change mock variables to your own. TOKEN can be a random sequence of char, you can use this https://randomkeygen.com/</li>
  <li>Save .env</li>
  <li> cd frontned/ </li>
  <li> yarn install (if you don't have yarn npm install --global yarn) </li>
  <li> cd .. </li>
  <li>In terminal type docker-compose up</li>
  <li>On http://localhost:5000 should be simple json with your toke</li>
  <li>On http://localhost:8086 should be login screen to influx</li>
  <li>On http://localhost:3000 should be frontend</li>
  <li>To log in to influx you need to type in credentials from .env</li>
</ol>
