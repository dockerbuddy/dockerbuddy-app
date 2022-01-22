rm -rf ./backend/src/main/resources/static
cd ./frontend
yarn run build
cd ..
cp -a ./frontend/build/. backend/src/main/resources/static
cd ./backend
mvn clean
mvn -DskipTests package
cd ..
docker build . -t kraleppa/dockerbuddy:${1:-latest}
cp ./backend/target/dockerbuddy-1.0.0.jar ./dockerbuddy-${1:-latest}.jar
docker push kraleppa/dockerbuddy:${1:-latest}