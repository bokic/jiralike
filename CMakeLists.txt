cmake_minimum_required(VERSION 3.20)

project(jiralike VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Threads REQUIRED)

if(NOT TARGET ws_backend)
    find_path(WS_BACKEND_INCLUDE_DIR
        NAMES wsserver.h
        PATHS "${CMAKE_CURRENT_SOURCE_DIR}/../cpp_ws_backend/src"
        PATH_SUFFIXES backend
    )
    find_library(WS_BACKEND_LIB
        NAMES ws_backend
        PATHS "${CMAKE_CURRENT_SOURCE_DIR}/../cpp_ws_backend/build"
    )
    if(NOT WS_BACKEND_LIB OR NOT WS_BACKEND_INCLUDE_DIR)
        message(FATAL_ERROR "Could not find ws_backend library or headers. Please install cpp_ws_backend.")
    endif()

    add_library(ws_backend UNKNOWN IMPORTED)
    set_target_properties(ws_backend PROPERTIES
        IMPORTED_LOCATION "${WS_BACKEND_LIB}"
        INTERFACE_INCLUDE_DIRECTORIES "${WS_BACKEND_INCLUDE_DIR}"
    )
endif()

file(GLOB_RECURSE SQL_FILES CONFIGURE_DEPENDS
    "${CMAKE_CURRENT_SOURCE_DIR}/db/*.sql"
)

set(EMBEDDED_SQL_DIR "${CMAKE_CURRENT_BINARY_DIR}/generated")
set(EMBEDDED_SQL_H "${EMBEDDED_SQL_DIR}/embedded_sql.h")
set(EMBEDDED_SQL_CPP "${EMBEDDED_SQL_DIR}/embedded_sql.cpp")

# Run script at configure time so headers/sources are available immediately
execute_process(
    COMMAND ${CMAKE_COMMAND}
        -DSQL_DIR=${CMAKE_CURRENT_SOURCE_DIR}/db
        -DOUTPUT_H=${EMBEDDED_SQL_H}
        -DOUTPUT_CPP=${EMBEDDED_SQL_CPP}
        -P ${CMAKE_CURRENT_SOURCE_DIR}/cmake/embed_sql.cmake
)

# Custom command to regenerate at build time if any .sql file changes
add_custom_command(
    OUTPUT ${EMBEDDED_SQL_H} ${EMBEDDED_SQL_CPP}
    COMMAND ${CMAKE_COMMAND}
        -DSQL_DIR=${CMAKE_CURRENT_SOURCE_DIR}/db
        -DOUTPUT_H=${EMBEDDED_SQL_H}
        -DOUTPUT_CPP=${EMBEDDED_SQL_CPP}
        -P ${CMAKE_CURRENT_SOURCE_DIR}/cmake/embed_sql.cmake
    DEPENDS ${SQL_FILES} ${CMAKE_CURRENT_SOURCE_DIR}/cmake/embed_sql.cmake
    COMMENT "Embedding SQL files into binary..."
    VERBATIM
)

add_executable(jiralike
    main.cpp
    src/qrcodegen.cpp
    ${EMBEDDED_SQL_CPP}
    ${EMBEDDED_SQL_H}
)

set_target_properties(jiralike PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
)

target_include_directories(jiralike PRIVATE
    ${EMBEDDED_SQL_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}
)

target_link_libraries(jiralike PRIVATE
    ws_backend
    fcgi
    json-c
    Threads::Threads
)
