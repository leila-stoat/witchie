#!/bin/bash
while IFS='' read -r line || [[ -n "$line" ]]; do
    read -r file hash title <<<"$line"
    echo "Downloading $title..."
    wget -O"$file" http://www.piskelapp.com/p/$hash/sprite
done < sprites.tbl