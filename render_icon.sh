#!/bin/sh

set -e

SIZES=( 32 48 96 128 256 )

for size in "${SIZES[@]}"; do
    outfile="src/icons/icon$size.png"

    convert -background none -size "${size}x${size}" danbooru.svg "$outfile"
    optipng -o7 -strip all "$outfile"
done
