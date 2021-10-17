rm -rf ./backend/src/main/resources/static
cd ./frontend
yarn run build
cd ..
cp -a ./frontend/build/. backend/src/main/resources/static
cd ./backend
mvn clean
mvn -DskipTests package
