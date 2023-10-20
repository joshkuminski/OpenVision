![OpenVision](https://github.com/joshkuminski/OpenVision/blob/main/Open-Vision/static/img/OVicon_1.png)

_This repository is a work in progress_

# OpenVision
Object Detection and Tracking for Traffic Counts and Analytics.

This repository leverages the powerful capabilities of the [Yolov7_StrongSORT_OSNet](https://github.com/mikel-brostrom/Yolov7_StrongSORT_OSNet) framework. Included is a user-friendly web application that allows users to effortlessly define movements and count vehilcles. A simple algorithm is employed to count the vehicles in 15-minute increments, and object detection is achieved through the use of [Yolov7](https://github.com/WongKinYiu/yolov7) while tracking is achieved via [StongSORT](https://github.com/dyhBUPT/StrongSORT) which combines motion and appearance information based on [OSNet](https://github.com/KaiyangZhou/deep-person-reid). 

# Background
A Turning Movement Count, is commonly used in traffic engineering to model intersections and optimize signal timing.

# Instructions
For More detailed instructions see [OpenVision]()
1. Install [python 3.8](https://www.python.org/downloads/release/python-380/):



## Before you run the tracker

1. Clone the repository:
```bash
git clone https://github.com/joshkuminski/OpenVision.git
```

2. cd into repo and clone the multiple object tracking (MOT) project:
```bash

cd OpenVision
git clone https://github.com/joshkuminski/Yolov7_StrongSORT_OSNet.git

```

3. cd into the MOT repo and clone the yolov7 project:
```bash

cd Yolov7_StrongSORT_OSNet
git clone https://github.com/joshkuminski/yolov7.git

```

4. clone the ReID project:
```bash
cd strong_sort\deep\reid
git clone https://github.com/joshkuminski/deep-person-reid.git
```

5. Make sure that you fulfill all the requirements: Python 3.8 or later with all [requirements.txt](requirements.txt) dependencies installed, including torch>=1.7. If you have a supported NVIDIA gpu, you need to comment out the torch install lines in requirements.txt. There are additional requirements if utilizing a gpu - [follow these instructions](https://docs.nvidia.com/deeplearning/cudnn/install-guide/index.html#install-windows). I recommend using cuDNN v8.3.2 and Cuda 11.3, if you go with something different you will need to update requirements_gpu.txt.   

## Install Requirements                                                                                               

### Custom Dataset
Custom weight files can be created using [OpenVision-Label]()


## Contact 
For questions please email joshuakuminski.github@gmail.com
For bugs and feature requests please visit [GitHub Issues](https://github.com/joshkuminski/Turning_Movement_Counter_Yolov7_StrongSort_OSNet/issues).

