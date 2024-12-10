# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION ${CMAKE_VERSION}) # this file comes with cmake

# If CMAKE_DISABLE_SOURCE_CHANGES is set to true and the source directory is an
# existing directory in our source tree, calling file(MAKE_DIRECTORY) on it
# would cause a fatal error, even though it would be a no-op.
if(NOT EXISTS "/home/paulo/esp/ESP8266_RTOS_SDK/tools/kconfig")
  file(MAKE_DIRECTORY "/home/paulo/esp/ESP8266_RTOS_SDK/tools/kconfig")
endif()
file(MAKE_DIRECTORY
  "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/kconfig_bin"
  "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix"
  "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix/tmp"
  "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix/src/mconf-idf-stamp"
  "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix/src"
  "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix/src/mconf-idf-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix/src/mconf-idf-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/home/paulo/.code/myhomeplant/esp-server-test/build/bootloader/mconf-idf-prefix/src/mconf-idf-stamp${cfgdir}") # cfgdir has leading slash
endif()
