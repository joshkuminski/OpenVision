import argparse
import json
import os
import shutil

# limit the number of cpus used by high performance libraries
os.environ["OMP_NUM_THREADS"] = "6"
os.environ["OPENBLAS_NUM_THREADS"] = "6"
os.environ["MKL_NUM_THREADS"] = "6"
os.environ["VECLIB_MAXIMUM_THREADS"] = "6"
os.environ["NUMEXPR_NUM_THREADS"] = "6"

import sys
from pathlib import Path
import torch
import torch.backends.cudnn as cudnn
from numpy import random


FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # yolov5 strongsort root directory
WEIGHTS = ROOT / 'weights'

sys.path.append(str(ROOT / 'weights'))

if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH
if str(ROOT / 'Yolov7_StrongSORT_OSNet/yolov7') not in sys.path:
    sys.path.append(str(ROOT / 'Yolov7_StrongSORT_OSNet/yolov7'))  # add yolov5 ROOT to PATH
if str(ROOT / 'Yolov7_StrongSORT_OSNet/strong_sort') not in sys.path:
    sys.path.append(str(ROOT / 'Yolov7_StrongSORT_OSNet/strong_sort'))  # add strong_sort ROOT to PATH
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # relative

from Yolov7_StrongSORT_OSNet.yolov7.models.experimental import attempt_load
from Yolov7_StrongSORT_OSNet.yolov7.utils.datasets import LoadImages, LoadStreams
from Yolov7_StrongSORT_OSNet.yolov7.utils.general import (check_img_size, non_max_suppression, scale_coords,
                                                          cv2, check_imshow, xyxy2xywh, increment_path,
                                                          strip_optimizer, colorstr, check_file)
from Yolov7_StrongSORT_OSNet.yolov7.utils.torch_utils import select_device, time_synchronized
from Yolov7_StrongSORT_OSNet.yolov7.utils.plots import plot_one_box
from Yolov7_StrongSORT_OSNet.strong_sort.utils.parser import get_config
from Yolov7_StrongSORT_OSNet.strong_sort.strong_sort import StrongSORT

# ****************************************************************
from TMC_Count import TmcCounter
# ****************************************************************

VID_FORMATS = 'asf', 'avi', 'gif', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'ts', 'wmv'  # include video suffixes

@torch.no_grad()
def run(
        source='0',
        yolo_weights=WEIGHTS / 'yolov7-OVcustom-v1_4.pt',  # model.pt path(s),
        strong_sort_weights=WEIGHTS / 'osnet_x1_0_market1501.pt',  # model.pt path,
        config_strongsort=ROOT / 'Yolov7_StrongSORT_OSNet/strong_sort/configs/strong_sort.yaml',
        imgsz=(640, 640),  # inference size (height, width)
        conf_thres=0.25,  # confidence threshold
        iou_thres=0.45,  # NMS IOU threshold
        max_det=1000,  # maximum detections per image
        device='',  # cuda device, i.e. 0 or 0,1,2,3 or cpu
        show_vid=False,  # show results
        save_txt=False,  # save results to *.txt
        save_conf=False,  # save confidences in --save-txt labels
        save_crop=False,  # save cropped prediction boxes
        save_vid=False,  # save confidences in --save-txt labels
        nosave=False,  # do not save images/videos
        classes=None,  # filter by class: --class 0, or --class 0 2 3
        agnostic_nms=False,  # class-agnostic NMS
        augment=False,  # augmented inference
        visualize=False,  # visualize features
        update=False,  # update all models
        project=ROOT / 'runs/track',  # save results to project/name
        name='exp',  # save results to project/name
        exist_ok=False,  # existing project/name ok, do not increment
        line_thickness=3,  # bounding box thickness (pixels)
        hide_labels=False,  # hide labels
        hide_conf=False,  # hide confidences
        hide_class=False,  # hide IDs
        half=False,  # use FP16 half-precision inference
        dnn=False,  # use OpenCV DNN for ONNX inference
        start_time=1600,
        colab=False,
):
    source = str(source)
    save_img = not nosave and not source.endswith('.txt')  # save inference images
    is_file = Path(source).suffix[1:] in (VID_FORMATS)
    is_url = source.lower().startswith(('rtsp://', 'rtmp://', 'http://', 'https://'))
    webcam = source.isnumeric() or source.endswith('.txt') or (is_url and not is_file)
    if is_url and is_file:
        source = check_file(source)  # download

    # Directories
    if not isinstance(yolo_weights, list):  # single yolo model
        exp_name = yolo_weights.stem
    elif type(yolo_weights) is list and len(yolo_weights) == 1:  # single models after --yolo_weights
        exp_name = Path(yolo_weights[0]).stem
        yolo_weights = Path(yolo_weights[0])
    else:  # multiple models after --yolo_weights
        exp_name = 'ensemble'
    exp_name = name if name else exp_name + "_" + strong_sort_weights.stem
    save_dir = increment_path(Path(project) / exp_name, exist_ok=exist_ok)  # increment run
    save_dir = Path(save_dir)
    (save_dir / 'tracks' if save_txt else save_dir).mkdir(parents=True, exist_ok=True)  # make dir

    # ************************************************************
    # Copy output files into project
    v_counts = ['TOTAL', 'CAR', 'TRUCK', 'BUS', 'BI']
    v_count = 0
    # TODO for Colab we need to grab these files from the colab instance and copy to the google drive
    #This copies the Output Data into the project folder on google drive
    for _ in v_counts:
        s_f = './Output_Data/Output_{}.txt'.format(v_counts[v_count])
        destination_folder = str(project) + '/{}/'.format(name)
        shutil.copy2(s_f, destination_folder)
        v_count += 1

    # Make a directory for ?
    data_path = str(project) + '/{}/data'.format(name)
    os.makedirs(data_path, exist_ok=True)

    # GET THE FILES FROM DOWNLOAD FOLDER AND PLACE IN /App_local/data/project/
    def get_last_n_files(folder_path, extension, is_colab=False):
        def set_variables(file):
            var_name = ['mask', 'zone_def', 'filename', 'zone_colors', 'Zones']
            split_file = file.split('/')[-1]
            with open('{}'.format(file), 'r') as f:
                if split_file.split('_')[0] == 'Color':
                    globals()[var_name[3]] = json.load(f)
                if split_file.split('_')[0] == 'Filename':
                    globals()[var_name[2]] = json.load(f)
                if split_file.split('_')[0] == 'Mask':
                    globals()[var_name[0]] = json.load(f)
                if split_file.split('_')[0] == 'Zone':
                    if split_file.split('_')[1] == 'Data':
                        globals()[var_name[4]] = json.load(f)
                    else:
                        globals()[var_name[1]] = json.load(f)
            f.close()

        # Get a list of files in the folder sorted by modification time
        files = sorted(
            [f for f in os.listdir(folder_path) if f.endswith(extension)],
            key=lambda x: os.path.getmtime(os.path.join(folder_path, x)),
            reverse=True
        )
        if is_colab:
            for file in files:
                set_variables(folder_path + file)
        else:
            for file in files:
                file = folder_path + '/' + file
                dest_folder = './Open-Vision/data/{}/'.format(project)
                new_file = dest_folder + file.split('/')[-1]
                shutil.copy2(file, dest_folder)
                os.remove(file)  # remove files from Input_Data folder
                # LOAD THE WEB APP DATA
                set_variables(new_file)

    frame_data = [[[]]]

    os.makedirs('./Open-Vision/data/{}/'.format(project.split('/')[-1]), exist_ok=True)
    extension = '.json'
    # If Input_Data has no .json files then there should be an existing project
    if not [f for f in os.listdir('./Input_Data') if f.endswith(extension)]:
        folder = './Open-Vision/data/{}/'.format(project.split('/')[-1])
        get_last_n_files(folder, extension, is_colab=True)  # Force colab = True
    else:
        folder = "./Input_Data"
        get_last_n_files(folder, extension, colab)

    if save_txt:
        image_path = './{}/{}/images'.format(project, name)
        os.makedirs(image_path, exist_ok=True)
        labels_path = './{}/{}/labels'.format(project, name)
        os.makedirs(labels_path, exist_ok=True)
    # ************************************************************

    # Load model
    device = select_device(device)
    
    WEIGHTS.mkdir(parents=True, exist_ok=True)
    model = attempt_load(Path(yolo_weights), map_location=device)  # load FP32 model
    names, = model.names,
    stride = model.stride.max()  # model stride
    imgsz = check_img_size(imgsz[0], s=stride.cpu().numpy())  # check image size

    # Dataloader
    if webcam:
        show_vid = check_imshow()
        cudnn.benchmark = True  # set True to speed up constant image size inference
        dataset = LoadStreams(source, img_size=imgsz, stride=stride.cpu().numpy())
        nr_sources = 1
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, mask=mask)
        nr_sources = 1
    vid_path, vid_writer, txt_path = [None] * nr_sources, [None] * nr_sources, [None] * nr_sources

    # initialize StrongSORT
    cfg = get_config()
    cfg.merge_from_file(opt.config_strongsort)

    # Create as many strong sort instances as there are video sources
    strongsort_list = []
    for i in range(nr_sources):
        strongsort_list.append(
            StrongSORT(
                strong_sort_weights,
                device,
                half,
                max_dist=cfg.STRONGSORT.MAX_DIST,
                max_iou_distance=cfg.STRONGSORT.MAX_IOU_DISTANCE,
                max_age=cfg.STRONGSORT.MAX_AGE,
                n_init=cfg.STRONGSORT.N_INIT,
                nn_budget=cfg.STRONGSORT.NN_BUDGET,
                mc_lambda=cfg.STRONGSORT.MC_LAMBDA,
                ema_alpha=cfg.STRONGSORT.EMA_ALPHA,

            )
        )
        strongsort_list[i].model.warmup()
    # *******************************
    # Initialize the TMC Counter
    tmc_class = TmcCounter(Zones, zone_def)
    # *******************************
    outputs = [None] * nr_sources

    colors = [[random.randint(0, 255) for _ in range(3)] for _ in names]

    # Run tracking
    dt, seen = [0.0, 0.0, 0.0, 0.0], 0
    curr_frames, prev_frames = [None] * nr_sources, [None] * nr_sources
    # ------------
    fps_count = 0
    interval = 0
    # -------------

    for frame_idx, (path, im, im0s, vid_cap, w, h, frame_num, nframes, img1) in enumerate(dataset):
        # img0s - masked image, img1 - should be a copy of the image before masking
        img1_ = img1[:]
        s = ''
        t1 = time_synchronized()
        im = torch.from_numpy(im).to(device)
        im = im.half() if half else im.float()  # uint8 to fp16/32
        im /= 255.0  # 0 - 255 to 0.0 - 1.0
        if len(im.shape) == 3:
            im = im[None]  # expand for batch dim
        t2 = time_synchronized()
        dt[0] += t2 - t1

        # Inference
        visualize = increment_path(save_dir / Path(path[0]).stem, mkdir=True) if visualize else False
        pred = model(im)
        t3 = time_synchronized()
        dt[1] += t3 - t2

        # Apply NMS
        pred = non_max_suppression(pred[0], conf_thres, iou_thres, classes, agnostic_nms)
        dt[2] += time_synchronized() - t3

        # ----------------------------------
        fps_count += 1
        fps = vid_cap.get(cv2.CAP_PROP_FPS)
        num_frames_15 = fps * 900

        vid_length = nframes / fps
        interval_15 = int(vid_length / 900)
        add_frames = int(nframes - num_frames_15 * interval_15)
        # add_frame = int(add_frames / interval_15)
        # num_frames_15 = num_frames_15 + add_frame
        # Add any remaining frames to the last bin
        if (interval + 1) == interval_15:
            rem = nframes - add_frames
            num_frames_15 = num_frames_15 + rem

        frame_list = []
        # -----------------------------------

        # Process detections
        for i, det in enumerate(pred):  # detections per image
            seen += 1
            if webcam:  # nr_sources >= 1
                p, im0, _ = path[i], im0s[i].copy(), dataset.count
                p = Path(p)  # to Path
                s += f'{i}: '
                txt_file_name = p.name
                save_path = str(save_dir / p.name)  # im.jpg, vid.mp4, ...
            else:
                p, im0, _ = path, im0s.copy(), getattr(dataset, 'frame', 0)
                p = Path(p)  # to Path
                # video file
                if source.endswith(VID_FORMATS):
                    txt_file_name = p.stem
                    save_path = str(save_dir / p.name)  # im.jpg, vid.mp4, ...
                # folder with imgs
                else:
                    txt_file_name = p.parent.name  # get folder name containing current img
                    save_path = str(save_dir / p.parent.name)  # im.jpg, vid.mp4, ...

            curr_frames[i] = im0

            txt_path = str(save_dir / 'tracks' / txt_file_name)  # im.txt
            s += '%gx%g ' % im.shape[2:]  # print string
            imc = im0.copy() if save_crop else im0  # for save_crop

            if cfg.STRONGSORT.ECC:  # camera motion compensation
                strongsort_list[i].tracker.camera_update(prev_frames[i], curr_frames[i])

            if det is not None and len(det):
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_coords(im.shape[2:], det[:, :4], im0.shape).round()

                # Print results
                for c in det[:, -1].unique():
                    n = (det[:, -1] == c).sum()  # detections per class
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                xywhs = xyxy2xywh(det[:, 0:4])
                confs = det[:, 4]
                clss = det[:, 5]

                # pass detections to strongsort
                t4 = time_synchronized()
                outputs[i] = strongsort_list[i].update(xywhs.cpu(), confs.cpu(), clss.cpu(), im0)
                t5 = time_synchronized()
                dt[3] += t5 - t4


                # draw boxes for visualization
                if len(outputs[i]) > 0:
                    for j, (output, conf) in enumerate(zip(outputs[i], confs)):

                        bboxes = output[0:4]
                        id = output[4]
                        cls = output[5]

                        # **************************************************************************
                        center_coordinates = (int(bboxes[0] + (bboxes[2] - bboxes[0]) / 2), int(bboxes[1] +
                                              (bboxes[3] - bboxes[1]) / 2))
                        frame_list.append(([id, center_coordinates[0], center_coordinates[1], frame_num]))


                        img1_ = tmc_class.count_TMC(bboxes, id, cls, im0, zone_colors, frame_num, img1, mask)
                        # im0 is a copy of the masked image img0s

                        if (fps_count > num_frames_15) or (frame_num == nframes):
                            interval += 1
                            r, missed_Count = tmc_class.create_bin(interval, start_time=start_time,
                                                                    frame_data=frame_data, rtor=False,
                                                                    project=project, name=name)
                            if frame_num == nframes:
                                # Print results
                                t = tuple(x / seen * 1E3 for x in dt)  # speeds per image
                                print(f'Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS, '
                                      f'%.1fms strong sort update per image at shape {(1, 3, imgsz, imgsz)}' % t)
                                sys.exit()
                            # reset counters and lists
                            tmc_class.fps_count = 0
                            fps_count = 0
                            frame_data.clear()
                            frame_data[:] = [[[]]]
                        # **************************************************************************
                        save_buffer = 10
                        if save_txt:
                            if frame_num % save_buffer == 0:
                                # to YOLO format - normalize data
                                bbox_left = output[0] / w
                                bbox_top = output[1] / h
                                bbox_w = (output[2] - output[0]) / w
                                bbox_h = (output[3] - output[1]) / h
                                with open(labels_path + '/' + str(frame_num) + '_' + name + '.txt', 'a') as f:
                                    f.write(('%g ' * 5 + '\n') % (cls, bbox_left,  # YOLO format
                                                                   bbox_top, bbox_w, bbox_h))
                                f.close()
                                cv2.imwrite(image_path + '/' + str(frame_num) + '_' + name + '.jpg', im0)

                        if save_vid or save_crop or show_vid:  # Add bbox to image
                            c = int(cls)  # integer class
                            id = int(id)  # integer id
                            label = None if hide_labels else (f'{id} {names[c]}' if hide_conf else \
                                (f'{id} {conf:.2f}' if hide_class else f'{id} {names[c]} {conf:.2f}'))
                            plot_one_box(bboxes, img1, label=label, color=colors[int(cls)], line_thickness=2)

                print(f'{s}Done. YOLO:({t3 - t2:.3f}s), StrongSORT:({t5 - t4:.3f}s)')

            else:
                strongsort_list[i].increment_ages()
                print('No detections')

            # Save results (image with detections)
            if save_vid:
                if vid_path[i] != save_path:  # new video
                    vid_path[i] = save_path
                    if isinstance(vid_writer[i], cv2.VideoWriter):
                        vid_writer[i].release()  # release previous video writer
                    if vid_cap:  # video
                        fps = vid_cap.get(cv2.CAP_PROP_FPS)
                        #w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                        #h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    else:  # stream
                        fps, w, h = 30, im0.shape[1], im0.shape[0]
                    save_path = str(Path(save_path).with_suffix('.mp4'))  # force *.mp4 suffix on results videos
                    vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (w, h))

                vid_writer[i].write(img1_)

            prev_frames[i] = curr_frames[i]
        # ------------------------------------
        #print(frame_list)
        if len(frame_list) > 0:
            frame_data.append(frame_list)
        # -----------------------------------
    # Print results
    t = tuple(x / seen * 1E3 for x in dt)  # speeds per image
    print(f'Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS, %.1fms strong sort update per image at shape {(1, 3, imgsz, imgsz)}' % t)
    if save_txt or save_vid:
        s = f"\n{len(list(save_dir.glob('tracks/*.txt')))} tracks saved to {save_dir / 'tracks'}" if save_txt else ''
        print(f"Results saved to {colorstr('bold', save_dir)}{s}")
    if update:
        strip_optimizer(yolo_weights)  # update model (to fix SourceChangeWarning)


def parse_opt():
    parser = argparse.ArgumentParser()
    parser.add_argument('--yolo-weights', nargs='+', type=str, default=WEIGHTS / 'yolov7-OVcustom-v1_4.pt', help='model.pt path(s)')
    parser.add_argument('--strong-sort-weights', type=str, default=WEIGHTS / 'osnet_x1_0_market1501.pt')
    parser.add_argument('--config-strongsort', type=str,
                        default='Yolov7_StrongSORT_OSNet/strong_sort/configs/strong_sort.yaml')
    parser.add_argument('--source', type=str, default='0', help='file/dir/URL/glob, 0 for webcam')
    parser.add_argument('--imgsz', '--img', '--img-size', nargs='+', type=int, default=[640], help='inference size h,w')
    parser.add_argument('--conf-thres', type=float, default=0.5, help='confidence threshold')
    parser.add_argument('--iou-thres', type=float, default=0.5, help='NMS IoU threshold')
    parser.add_argument('--max-det', type=int, default=1000, help='maximum detections per image')
    parser.add_argument('--device', default='', help='cuda device, i.e. 0 or 0,1,2,3 or cpu')
    parser.add_argument('--show-vid', action='store_true', help='display tracking video results')
    parser.add_argument('--save-txt', action='store_true', help='save results to *.txt')
    parser.add_argument('--save-conf', action='store_true', help='save confidences in --save-txt labels')
    parser.add_argument('--save-crop', action='store_true', help='save cropped prediction boxes')
    parser.add_argument('--save-vid', action='store_true', help='save video tracking results')
    parser.add_argument('--nosave', action='store_true', help='do not save images/videos')
    # class 0 is person, 1 is bycicle, 2 is car... 79 is oven
    parser.add_argument('--classes', nargs='+', type=int, help='filter by class: --classes 0, or --classes 0 2 3')
    parser.add_argument('--agnostic-nms', action='store_true', help='class-agnostic NMS')
    parser.add_argument('--augment', action='store_true', help='augmented inference')
    parser.add_argument('--visualize', action='store_true', help='visualize features')
    parser.add_argument('--update', action='store_true', help='update all models')
    parser.add_argument('--project', default=ROOT / 'runs/track', help='save results to project/name')
    parser.add_argument('--name', default='exp', help='save results to project/name')
    parser.add_argument('--exist-ok', action='store_true', help='existing project/name ok, do not increment')
    parser.add_argument('--line-thickness', default=3, type=int, help='bounding box thickness (pixels)')
    parser.add_argument('--hide-labels', default=False, action='store_true', help='hide labels')
    parser.add_argument('--hide-conf', default=False, action='store_true', help='hide confidences')
    parser.add_argument('--hide-class', default=False, action='store_true', help='hide IDs')
    parser.add_argument('--half', action='store_true', help='use FP16 half-precision inference')
    parser.add_argument('--dnn', action='store_true', help='use OpenCV DNN for ONNX inference')
    parser.add_argument('--start-time', default=1600)
    parser.add_argument('--colab', default=False, action='store_true')
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1  # expand

    return opt


def main(opt):
    #check_requirements(requirements=ROOT / 'requirements.txt', exclude=('tensorboard', 'thop'))
    run(**vars(opt))


if __name__ == "__main__":
    opt = parse_opt()
    main(opt)
