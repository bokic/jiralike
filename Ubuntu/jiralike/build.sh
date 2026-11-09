#!/bin/bash -e
PKG_DIR="pkg_build"
rm -rf "$PKG_DIR"
mkdir -p "$PKG_DIR/DEBIAN"
mkdir -p "$PKG_DIR/opt/jiralike"
mkdir -p "$PKG_DIR/var/lib/jiralike/db"
mkdir -p "$PKG_DIR/var/lib/jiralike/blobs"
mkdir -p "$PKG_DIR/etc/systemd/system"

cp -r DEBIAN/* "$PKG_DIR/DEBIAN/"
(cd ../../../.. && ./build.sh)
cp ../../jiralike "$PKG_DIR/opt/jiralike/jiralike"
cp ../../jiralike.service "$PKG_DIR/etc/systemd/system/jiralike.service"

dpkg-deb --build "$PKG_DIR" jiralike_0.1.deb
rm -rf "$PKG_DIR"
