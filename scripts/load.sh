#!/bin/bash
phone=$1
num_options=$2
attackers=$3
i=0
while [ $i -lt $num_options ]
do
  i=$(($i+1))
  node load.js $phone $i $attackers &
done
