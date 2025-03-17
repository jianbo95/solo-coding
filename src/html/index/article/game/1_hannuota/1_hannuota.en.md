
It's simple, indeed my first game

# Tower of Hanoi Game

## Why I Created This Game

When I was young, I came across this game on an electronic dictionary and had a lot of fun playing it. Now I finally have the chance to make it myself. Although it's simple, it's quite interesting. I hope I can keep going, cheers!

It also appeared in an anime called "Kami no Puzzle" (God's Puzzle), which I recommend watching.

[Play Now](https://www.solo-coding.org/#/game/hannuota)

## Introduction

The Tower of Hanoi is a classic mathematical game consisting of three rods and a number of disks of different sizes. The objective is to move all disks from one rod to another, following these rules:

1. Only one disk can be moved at a time.
2. A larger disk must never be placed on top of a smaller disk.

## Game Rules

1. **Start**: All disks are stacked on the leftmost rod in ascending order, with the largest disk at the bottom and the smallest at the top.
2. **Goal**: Move all disks to the rightmost rod.
3. **Rods**: The three rods are labeled A, B, and C.
   - A: Source rod
   - B: Auxiliary rod
   - C: Target rod

## Solution

The Tower of Hanoi can be solved using recursion. Let n be the number of disks:

1. Move the top n-1 disks from rod A to rod B, using rod C as auxiliary.
2. Move the nth disk (largest disk) from rod A to rod C (target rod).
3. Move the n-1 disks from rod B to rod C, using rod A as auxiliary.

## Example

Here's a simple example with 3 disks:

1. A to C: Move disk 1 from A to C.
2. A to B: Move disk 2 from A to B.
3. C to B: Move disk 1 from C to B.
4. A to C: Move disk 3 from A to C.
5. B to A: Move disk 1 from B to A.
6. B to C: Move disk 2 from B to C.
7. A to C: Move disk 1 from A to C.

Finally, all disks are successfully moved to rod C.