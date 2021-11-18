package pl.edu.agh.dockerbuddy

import com.google.gson.Gson
import java.io.File
import java.util.*


fun <T> loadMock(filename: String, classType: Class<T> ): T {
    val gson = Gson()

    val buffReader = File(Objects.requireNonNull({}::class.java.classLoader.getResource(filename)).path).bufferedReader()
    val jsonString = buffReader.use { it.readText() }

    return gson.fromJson(jsonString, classType)
}