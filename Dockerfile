FROM openjdk:11
COPY ./backend/target/ .
ENTRYPOINT ["java", "-jar", "dockerbuddy-0.0.1-SNAPSHOT.jar"]