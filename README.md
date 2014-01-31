Image-Browser-with-Gesture-Recognizer
=====================================

This is an image browser which can not only displayimages, but also allow users to interact with it by gestures.

This gallery consists of a set of thumbnails that link to the full sized images. Once the a thumbnail is clicked, the full-size picture will be shown.

Over Process:

1. Play with $1 Unistroke Gesture and Read the Code

The $1 is designed for recognizing user’s gestures. By the less-than-100 lines code, people can quickly add gesture recognition feature to their applications. It is very accurate.

The code shows that this algorithm works in 4 steps:

� Resampling the recorded path into a fixed number of points that are evenly spaced along the path

� Rotating the path so that the first point is directly to the right of the path’s center of mass.

� Scaling the path (non-uniformly) to a fixed hight and width

� For each reference path, calculating the average distance for the corresponding points in the input path. The path with the lowest average point distance is the match.

<br>

2. Use Seven Stages of Action(--Norman 1988), Golden Rules of UI Design, Ten Usability Heuristics, and Fitt’s Law to refine the initial design. Make the final Design version. Justify why making such decisions.

1)Visibility of System Status: to keep users informed about what is going on, through feedback within reasonable time

A. Highlighting selected picture’s thumbnails.

B. Displaying cursor tracking the mouse (“the cursor path”).

2)Match between system and the real word: speak the user’s language, use words and phrases familiar to the user.

The name of buttons and gestures are defined as “Next” ”Previous” ”Stop” ”Continue” ”Manual”, which follows the real world conventions. In real word, we also say and think like this.
<img src="https://s3.amazonaws.com/js4153/16.png">

3)User control and freedom

A.User can choose to control the application in two methods：they can either click the buttons on the screen or choose to control the gallery by drawing gestures on canvas.

B.The interface is simple, and no complex layers, users will find it difficult to get lost in this application, they will be always aware that what they are doing.

4)Consistency and Standards

A. Terminology Consistent:

B. Platform Consistent:



5)Recognition rather than recall

To minimize the user’s memory load, the message on top of the gallery will always tell the user what they are doing now. 

6)Feedback: Minimize the” Gulf of Evaluation”

The words shown on top of the image gallery gives users feedback when they are drawing on the screen.

7)Aesthetic and minimalist design

Users are always reluctant to read words and texts, they prefer to watch pictures and make interactions. 

8)Flexibility and efficiency of use
For novice user, they can make interaction with the system by clicking the isible buttons, they are easy to see and reach.

For expert user, they have short cuts. The gesture features allow them to speed up interaction with the system.

9）Help and documentation.

10) Universal Usability

3. Build

<img src="https://s3.amazonaws.com/js4153/17.png">


4. Release

5. References:

1) http://www.juicebox.net/demos/  http://wowslider.com/demo.html

2) http://www.dhtmlgoodies.com/index.html?whichScript=image-gallery-2011
