# Boids Flocking Simulation
A simulation that replicates the flocking behavior seen in nature, similar to how birds and fish move cohesively in groups.

**Run** : https://boids-flocking.vercel.app/ <br>
View related post on [Twitter](https://x.com/0xJatinChopra/status/1854912692898930803) , [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7260350210734776320/)

## How it works 
This core of this simulation is based on Steering Forces. 

Basic Flocking Rules Include 
1. **Separation**: Boids steer away to avoid bumping into each other
2. **Alignment**: Boids steer in the same direction as nearby boids.
3. **Cohesion**: Boids steer towards the center of the group.


Predator-Prey Dynamics: A predator chases one group of boids while the others avoid it if it gets too close. 
I also gave predator ability to shoot projectiles and show explosion with some simple particle effect.

I wanted it to look more cool so I made the camera follow predator in a cinematic way and added unreal bloom effect. 

   

## Screenshots
![boid](https://github.com/user-attachments/assets/096d6a4a-0cf6-4f18-a1a9-eb672b9782b8)
![image](https://github.com/user-attachments/assets/ac0df05a-dde0-4338-ac71-1b25470204ce)

## Resources
[Original Boids Model by Craig Reynolds](https://www.red3d.com/cwr/boids/)<br>
[SubOptimal Engineer Three.js Playlist](https://www.youtube.com/watch?v=MSZ7nqqgVKc&list=PLTJ_bWjv6i7zjdyy3kQWY_1dADz-3n7iI)<br>
[Nature of Code - Autonomous Agents](https://natureofcode.com/)
