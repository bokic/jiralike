#!/bin/bash -e

rm -f *.deb

(cd jiralike              ; ./build.sh; mv *.deb ..)
(cd jiralike-config-nginx ; ./build.sh; mv *.deb ..)
(cd jiralike-fe           ; ./build.sh; mv *.deb ..)
