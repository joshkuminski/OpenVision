## Turning_Movement_Counter_w/_Yolov7_StrongSORT_OSNet





<div align="center">
<p>
<img src="Flask_App/demo.gif" width="400"/>  <img src="demo.gif" width="400"/> 
</p>
  <p><i>----------------------- Web Application ---------------------</i><i>---------------------- Output Video --------------------</i>
  </p>
<br>
  
<a href="https://colab.research.google.com/drive/13vHgJh_sT52fsWvrhmbNx_RK21hI0tBS#scrollTo=rEAldD9xRFG1=sharing"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>
</div>

</div>


## Introduction
*This is a work in progress*

This repository is a project that aims to count the number of vehicles making turning movements at an intersection. It leverages the powerful capabilities of the [Yolov7_StrongSORT_OSNet](https://github.com/mikel-brostrom/Yolov7_StrongSORT_OSNet) framework to achieve this goal. The project includes a user-friendly web application that allows users to define the different movements at the intersection. A simple algorithm is employed to count the vehicles in 15-minute increments, and object tracking is achieved through the use of Yolov7_StrongSORT_OSNet. A Turning Movement Count, is commonly used in traffic engineering to model intersections and optimize signal timing.

## Prerequisites
In order to run the colab example you need to first have an [ngrok](https://ngrok.com/) auth token. No need for ngrok if you want to run on your local machine.

## Before you run the tracker

1. Clone the repository:
```bash
git clone https://github.com/joshkuminski/Turning_Movement_Counter_Yolov7_StrongSort_OSNet.git
```

2. cd into repo and clone the multiple object tracking (MOT) project:
```bash

cd Turning_Movement_Counter_Yolov7_StrongSort_OSNet
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
6. To install requirements for this project, run:
```bash
cd Turning_Movement_Counter_Yolov7_StrongSort_OSNet
pip install -r requirements.txt 
pip install -r requirements_gpu.txt  # only if you have a supported NVIDIA gpu
```

### Run the Flask App
```bash

cd Flask_App
$ python main.py

```

### Run the Tracker

```bash

$ python track.py --source <path to video> --yolo-weights yolov7-e6e.pt --img 640 --classes 2 3 5 7 --strong-sort-weights osnet_x0_25_market1501.pt --save-vid
                                                                                                                                                     --show-vid --device 0 #if cuda is available
```

### Custom Dataset
Custom weight file created using the Miovision Dataset (https://tcd.miovision.com/). This dataset is more accurate than the COCO dataset for turning movement counts. The classes available are [articulated_truck, bicycle, bus, car, motorcycle, motorized_vehicle, non-motorized_vehicle, pedestrian, pickup_truck, single_unit_truck, work_van].  Contact me for the custom yolov7 weight file.


## Contact 
For questions please email joshuakuminski.github@gmail.com
For bugs and feature requests please visit [GitHub Issues](https://github.com/joshkuminski/Turning_Movement_Counter_Yolov7_StrongSort_OSNet/issues).

