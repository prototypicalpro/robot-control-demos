# DootCamp Robotics Talk

![CI](https://github.com/prototypicalpro/robot-control-demos/workflows/CI/badge.svg?event=push)

This website contains the slides for my DootCamp talk on robot control systems. Making a website allowed me to include simulations in my slides, which helps a lot when talking about the practical effects of small software changes. You can use Shift+ArrowLeft or Shift+ArrowRight to changes the slide.

At the moment the code is very messy but seems to work. The [robot simulation engine](./src/components/RobotSim.tsx) is built using [matter-js](https://brm.io/matter-js/) for physics, [react-vis](https://uber.github.io/react-vis/) for graphing, and [react-simple-code-editor](https://github.com/satya164/react-simple-code-editor) for an interactive code prompt. The [slideshow](./src/components/SlideShow.tsx) is a [bootstrap carousel](https://react-bootstrap.github.io/components/carousel/) with some keyboard controls tacked on.

When I have finished giving this talk, I will post a recording here.
