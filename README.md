# Still Life VR

![VR Screenshot](assets/screenshot.png)

## Description

This Virtual Reality (VR) project was undertaken as part of the _Virtual and Augmented Reality_ course at the University of Lausanne (UNIL), under the direction of [Isaac Pante](https://github.com/ipante/).

Inspired by the cover of the album _Still Life_  (1999) by the Swedish progressive metal band Opeth, this VR experience allows users to immerse themselves in an ambient (and auditory) experience of their music.

Comprising audio input, moving and generative elements, light and shadow, noise, gradients, and reflection, this project opens up many more avenues for future development.

![Album Cover](https://m.media-amazon.com/images/I/71XzoNNpV1L._UF894,1000_QL80_.jpg)

## Installation

1. Clone this repository locally.
2. Open `index.html` using the _Live Server_ extension.
3. Allow for audio input from your microphone.
4. Enjoy the ambience of the developing scene with your own musical accompaniment.

## Dependencies

- _Three.js_ - a library for building 3D graphics.
- _OrbitControls.js_ - a feature that allows for navigation.
- _Noise.js_ - a library for generating noise.

## Functionality

<div align="center">
    <img src="assets/video.gif" alt="VR Experience">
</div>

### Background

To create the appearance of a gradated, more naturalistic background, I chose to surround the entire scene in a sphere to which **fragment** and **vertex shaders** were applied, allowing for a **radial gradient** effect on the backdrop.

### Ground

I spent time researching how to create convincing terrain so that I could avoid simply using a flat plane. I discovered the answer in **terrain plane geometry**, which modifies the **vertices** of a plane randomly to allow for an undulating appearance.

### Pond

It took me some time to work out how to effectively create a reflective surface with **Three.js**. After looking into reflector examples for some time, I found the solution of displaying the visual of a **cube camera** in the surface of the pond mesh, positioning the camera at the centre of the scene and providing a **360-degree** view of its surroundings. Whilst the result is not perfect, it is by all means very convincing and I am very satisfied.

The pond shape has also been made to be **noisey** so that the edges are not entirely circular. This effect is more naturalistic and less artificial than a simple circle or sphere mesh.

Furthermore, the coordinates of all other objects are checked so that they do not fall inside the area designated for the pond.

### Grass

Whilst the individual blades of grass are relatively simple, made up of a simple **cone geometry**, I have added two layers to the plane to allow for a more natural distribution throughout the scene. One layer is simply formed of randomly distributed blades, whereas the other is formed of randomly distributed **clusters**. The field of grass randomly oscillates to evoke the idea of wind.

### Trees

One of the central ideas of this project was the idea of the trees growing with audio input. To achieve this effect, I decided to form the trees from **segments** created using **cylinder geometry**. Randomised **x, y,** and z **positions** allow for a twisted aesthetic. Whilst this effect could be improved with more complex mathematical logic, I am satisfied with the result.

#### Trunks

The trunks are the first part of the tree to grow, **audio input** resulting in further segments to be stacked on top of each other. All trunks grow together at the same time to create a more impressive effect. Due to lag, I have reduced the size of the scene and the number of its components, but both can be altered as required.

#### Branches

Once the trees are completed, the branches of the trees begin to grow, also in response to audio input. The branches were the most difficult part of this project. I discovered that all of the branches were growing out in the same direction on each tree, instead of growing randomly around the tree.

To remediate this problem, I added a randomised **y-axis rotation** to the entire branch. However, this rotation took place from the centre of the entire branch object, displacing the **x** and **z coordinates** away from the trunk. I soon found out how to effectively calculate the **x** and **z offsets** caused by rotation around the y axis:

```js
x' = x ⋅ cos(θ) + z ⋅ sin(θ);
z' = -x ⋅ sin(θ) + z ⋅ cos(θ);
```

I therefore created the following function to circumvent this problem:

```js
function rotate(x, z, degrees) {
  const cos = Math.cos(degrees);
  const sin = Math.sin(degrees);
  const newX = x * cos + z * sin;
  const newZ = -x * sin + z * cos;
  return { x: newX, z: newZ };
```

Problems pertaining to **function scope** held me back, since the values required for this operation were contained in two different functions that were mutually inaccessible.

Without wanting to start from scratch with this central part of the project, I managed instead to solve the problem by introducing **pivot points** at certain segments on the trunk, onto which I attached the branches. This approach allowed the rotation to take place at the start of each branch, ensuring that they originated from the correct x and z coordinates of the segment at the given y coordinate.

Again, the branches as a whole could be improved by reducing gaps between segments that are introduced by the minimal rotation of each segment. Even so, I am highly content that I resolved this frustrating problem to create a convincing tree object.

#### Leaves

The leaves begin to grow once the trunks and branches are complete. I also **set a timeout** so they do not immediately and rapidly start growing. The shape of each leaf could be slightly randomised or complexified. Although the leaves aren't exactly attached to the branches, the impression given is sufficient for the purposes of this project. The leaves are randomly rotated around each pivot.

Once the leaves have all been added to the scene, the leaves begin to fall. When audio input reaches a certain level, much like with the trunks and branches, a **boolean** is **toggled**, a random **index position** in the leaves **array** is selected, and **velocity** is added to the selected leaf, causing it to fall, before another is selected. In the future, it would be even more convincing to select a handful of index positions to cause a group of leaves to fall at the same time instead.

### Cross

Using **box geometry** I created the cross object seen in the background of the album cover. I have added it at a similar distance from the camera and positioning on the border of the pond as in the cover art. A slight rotation allows it to appear slightly more naturalistic.

### Moon

The moon, though a simple component to develop with **sphere geometry**, is one of my favourite additions to the scene. The **high-resolution texture** works well. The moon gradually **orbits** the scene.

### Lighting

The moon equally emits light. I have used **point light** to illuminate the moon itself, although without much effect, and **directional light** to cast moonlight onto the scene. After some time experimenting with directional light properties, I have ensured that it casts shadows onto the scene effectively. Furthermore, the light source is the moon, and so the coordinates of the light change as the moon orbits, meaning that the shadows also move gradually.

### Birds

A simple addition using **quadratic curves** and **shape geometry**, which could be given further complexity at a later stage. A biased boolean is produced at random to determine when a random bird shape flips to give the impression of flight.

The birds also have a slight velocity to allow them to move in the scene.

### Haze

Although the colour of the haze is not quite what I intended (that on the album cover has a more bright, orange-coloured hue), the haze is another sphere layer created using **noise**, emulating the haziness of the album cover and offering a more rich, textured atmosphere.

### Mist

As the **Three.js fog class** only served to obscure all objects in the scene, including the moon, I opted for a more manual rendition of mist. Although its white colour is not the same as the album cover, I felt it contrasted well with the heavy redness of the scene.

The mist is a system made up of ``1,000,000`` particles. I have made the addition of this high number of particles less intensive by first creating two empty **float 32 arrays** of the required **dimensions** to hold, respectively, the randomised movement and particle coordinate data. I have equally used **buffer geometry** and **attributes** to ensure that the large number of vertices is managed efficiently.

## Future

### Further Development

There are several areas that have potential for further development.

#### Revolving Background

There is a lighter and darker part of the gradient background. It would make sense, therefore, for the sphere to revolve at the same time as the moon orbits the scene, so the lighting of the sky makes sense.

#### Pond Complexity

##### Rippling Pond

I wanted to create another plane, filter, particle system, or other feature, to create a rippling effect on the water. As it stands, the movement of the grass and mist created a minor illusion of movement, but a ripple effect would be a nice touch.

##### Distorted Reflection

One interesting part of the album cover is that what is reflected in the pond (the cross) is actually reflected as the figure of a person. Although there are slight variations in this effect in the original and remastered cover art, the effect is similar. I was wondering if there is a way of showing an alternative object to the cube camera than to the scene camera...

#### Smoother Trees

The trunk of the tree is very clearly segmented, especially up close. Whilst I appreciate this aesthetic, I would like to achieve a smoother effect in the future.

#### Further Branches

Taking inspiration from the **generative art** approach of creating **procedural trees**, it would be effective to optimise the growing of trees and branches, using **recursive algorithmic processed** so that branches also grow from the branches themselves, to create an even more complex tree object.

#### Leaf Complexity

The leaf texture colour could be improved to be more attuned to the album cover, even though it contrasts well with the rest of the scene. The way the texture is applied is also not perfect, as the texture **repeats** instead of the leaf shape **cropping** the texture.

##### Quivering Leaves

Whilst there are many ways the leaves could be improved, one idea I had was to create a quivering movement, as if wind is passing through the trees.

##### Swirling Leaves

Another possibility is that, instead of **splicing** leaves from the leaf array once `y < -1`, the leaves stay at the level of the terrain that they meet upon falling. Every now and then, the fallen leaves could swirl up in the air together before falling again, as if by wind.

#### Grass Complexity

The grass, in general, could be improved through a procedural approach, much like the trees. However, the grass could easily be improved by adding different varieties of grass, or by allowing the cones to be bent, or equally by applying a gradient to them instead of a **uniform colour**.

##### Reeds

One idea I had was to add reeds or long grass to the edge of the pond, something that could be easily achieved using **tube geometry** and appending the tubes to the top of the grass blade.

##### Shrubs

Some more scraggly weeds and shrubs could be added to emulate the album cover further. These shrubs could be a cross between the trees and the grass, with thinner branches but small leaves. The leaf shape could then be reused but diminished in size.

##### Roses

Another aspect of the album cover is a rose bush. The roses themselves might be more complex to bring about convincingly, but a shortcut might be to create a sphere, cone, or half-tube and apply a rose texture to it.

#### Bird Complexity

It would be interesting to work on creating a convincing bird object, but such an undertaking would be a project unto itself. However, it would be interesting to create a more 3D bird and perch one on a branch or shrub in the scene, much like in the album cover.

#### Improved Haze

I am not satisfied overall with the rendering of the mist. The particle size should be reduced and a higher number of particles created (although doing so would be too intensive for my computer). I would like to add further complexity in the future, particularly in terms of colour, position, and movement.

### New Features

The addition of new features may also add a new dimension to this VR experience.

### Statue

Another object that I felt went beyond the scope of this project. My argument for avoiding this object is that the user themselves acts as the statuesque figure in the scene (although one might then argue that the addition of hands to the camera position and a shadow might then make sense).

Again, much like with the rose bush, it might be possible to apply a texture to a human-like shape instead of building a human figure from scratch. The figure itself could be cropped from the album cover and used as the texture.

However, due to the low resolution of the album cover pictures available and the size of the object relative to the scene, the effect may not be convincing. One way around this problem might be to position the figure away from the camera.

### Wind

It would be interesting to research ways of adding consistent wind throughout a scene in **Three.js**. Whilst it would be possible to add the same movement to all moveable elements in a scene, it would be more effective to create a standardised array of velocities that can then be applied universally.

### Day

I was toying with the idea of creating a feature that allows the user to toggle between night (the current state of the scene) and day (a version with a sun, stronger light, and a blue sky, perhaps with clouds). This feature would be an easy addition as it simply requires a new boolean, colour changes, the removal of the moon from the scene, and the addition of a textured sun sphere object... And perhaps removing the cross for a less dismal atmosphere!

Although not aligned with the album cover, this feature would offer added engagement and power to the user.

### Filter

The original album cover (as opposed to the remastered one on which most of this project is based) has a scratched appearance to it, as well as a **vignette**. It would be interesting to add a scratched-up, vignette-like filter to the camera, so that the user looks through such a distorted image.

### Sounds

As an alternative to giving your own audio input (through music or the dulcet tones of the user's own voice or just clapping), it would be nice to create a setting that simply allowed the user to enjoy a more sonorous experience within the environment I have created. Adding some (perhaps creepy) **sound effects** using **Three.js's audio loader**, such as trees creaking, leaves rustling, water moving, birds cawing, a woman crying, etc., could be an interesting alterative.

### Interactivity

Lastly, but certainly not least, a large part of VR is the ability of the user to interact with the scene around them. Whilst this experience is certainly immersive in nature, it has no element of **interactivity** beyond audio input.

I have seen some projects using the aim of the user's **cursor** or **controller** (depending on the circumstances) to move the grass, create ripples in a watery surface or cause objects on the ground like leaves to be disturbed. Perhaps the positioning of the user could be used to set birds into flight if the user comes into close proximity with them.

Another idea might be to introduce an aspect of **gamification** with certain goals to fulfill in the scene. However, the objective of this project was to create an immersive experience for a user to enjoy Opeth's music, something I have executed well.

## References

### Scripts

[Three.js](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js)
[OrbitControls.js](https://unpkg.com/three@0.111.0/examples/js/controls/OrbitControls.js)
[Noise.js](https://cdn.jsdelivr.net/gh/josephg/noisejs@latest/perlin.js)

### Objects

[Scene](https://threejs.org/docs/#api/en/scenes/Scene)
[Clock](https://threejs.org/docs/#api/en/core/Clock)
[TextureLoader](https://threejs.org/docs/#api/en/loaders/TextureLoader)
[PerspectiveCamera](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera)
[WebGLRenderer](https://threejs.org/docs/?q=web%20ren#api/en/renderers/WebGLRenderer)
[OrbitControls](https://threejs.org/docs/?q=orbit#examples/en/controls/OrbitControls)
[WebGLCubeRenderTarget](https://threejs.org/docs/?q=webgl#api/en/renderers/WebGLCubeRenderTarget)
[CubeCamera](https://threejs.org/docs/?q=cube#api/en/cameras/CubeCamera)
[Color](https://threejs.org/docs/#api/en/math/Color)
[MeshBasicMaterial](https://threejs.org/docs/?q=mesh%20basic#api/en/materials/MeshBasicMaterial)
[MeshStandardMaterial](https://threejs.org/docs/?q=mesh%20stand#api/en/materials/MeshStandardMaterial)
[PointsMaterial](https://threejs.org/docs/?q=points#api/en/materials/PointsMaterial)
[ShaderMaterial](https://threejs.org/docs/?q=shader%20ma#api/en/materials/ShaderMaterial)
[Vector3](https://threejs.org/docs/?q=vector3#api/en/math/Vector3)
[Group](https://threejs.org/docs/?q=group#api/en/objects/Group)
[CylinderGeometry](https://threejs.org/docs/?q=cyli#api/en/geometries/CylinderGeometry)
[Mesh](https://threejs.org/docs/?q=mesh#api/en/objects/Mesh)
[Shape](https://threejs.org/docs/?q=shape#api/en/extras/core/Shape)
[ShapeGeometry](https://threejs.org/docs/?q=shape#api/en/geometries/ShapeGeometry)
[SphereGeometry](https://threejs.org/docs/?q=sphere#api/en/geometries/SphereGeometry)
[PointLight](https://threejs.org/docs/?q=pointl#api/en/lights/PointLight)
[DirectionalLight](https://threejs.org/docs/?q=direc#api/en/lights/DirectionalLight)
[PlaneGeometry](https://threejs.org/docs/?q=plane#api/en/geometries/PlaneGeometry)
[BoxGeometry](https://threejs.org/docs/?q=box%20ge#api/en/geometries/BoxGeometry)
[BufferGeometry](https://threejs.org/docs/?q=buffer#api/en/core/BufferGeometry)
[BufferAttribute](https://threejs.org/docs/?q=buffer#api/en/core/BufferAttribute)
[Points](https://threejs.org/docs/?q=points#api/en/objects/Points)
[ConeGeometry](https://threejs.org/docs/?q=cone#api/en/geometries/ConeGeometry)

### Sources

[Shaders](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shadershttps://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders)
[Textures](https://www.solarsystemscope.com/textures/)
[Rotation](http://learnwebgl.brown37.net/transformations2/transformations_rotate.html)
[Terrain](https://woodenraft.games/blog/generating-terrain-plane-geometry-three-js)
[Noise](https://github.com/josephg/noisejs)
[Grass](https://github.com/James-Smyth/three-grass-demo/blob/main/src/index.js)
[Audio](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor)