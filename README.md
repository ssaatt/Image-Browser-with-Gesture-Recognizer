Image-Browser-with-Gesture-Recognizer
=====================================

This is an image browser which can not only displayimages, but also allow users to interact with it by gestures.

This gallery consists of a set of thumbnails that link to the full sized images. Once the a thumbnail is clicked, the full-size picture will be shown.

Over Process:

1. Play with $1 Unistroke Gesture and Read the Code

The $1 is designed for recognizing user’s gestures. By the less-than-100 lines code, people can quickly add gesture recognition feature to their applications. It is very accurate.

The code shows that this algorithm works in 4 steps:
� Resampling the recorded path into a fixed number of points that are evenly
spaced along the path
� Rotating the path so that the first point is directly to the right of the path’s
center of mass.
� Scaling the path (non-uniformly) to a fixed hight and width
� For each reference path, calculating the average distance for the
corresponding points in the input path. The path with the lowest average
point distance is the match.
