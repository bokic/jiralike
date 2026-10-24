add_executable(jiralike main.cpp)

set_target_properties(jiralike PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
)

target_link_libraries(jiralike PRIVATE
    ws_backend
    sqlite3
    json-c
)
