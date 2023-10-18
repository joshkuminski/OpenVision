from itertools import islice
import numpy as np
import pandas as pd
import math
from collections import Counter
import matplotlib.pyplot as plt


class TmcClassification:
    def __init__(self, processed_raw_data, processed_zone_detections, num_values, zone_def, ids_delete=[],
                 ids_delete_2=[], ids_last_frame=[], interval=1, rtor=False, project=None, name=None, start_time=1600):
        self.processed_raw_data = processed_raw_data
        self.processed_zone_detections = processed_zone_detections
        self.num_values = num_values
        self.zone_def = zone_def
        self.ids_delete = ids_delete
        self.ids_delete_2 = ids_delete_2
        self.ids_last_frame = ids_last_frame
        self.interval = interval
        self.Count = [[0] * 16 for _ in range(5)]
        self.Missed = []
        self.missed_Count = [0] * 16
        self.CarryOverDetections = []
        self.buildZoneList = []
        self.start_time = start_time
        self.rtor = rtor
        self.active_leg = 0
        #self.NN_data_XY_train = []
        #self.NN_data_class_train = np.array(1)
        #self.NN_data_XY_test = []
        self.project = project
        self.name = name

    def TMC_count(self):
        movement = [0] * 4
        count_rng = len(self.Count[0])
        buildList = []
        plt_colors = ['c', 'g', 'm', 'y']  # NB, SB, EB, WB

        for TMC_count in self.processed_zone_detections:  # loop through each group of detections
            j = 0
            i = 0
            break_out = False

            # INSERT THE VEHICLE DATA FROM THE PREVIOUS 15MIN
            for z in self.CarryOverDetections:
                if TMC_count[0][0] == z[0]:
                    TMC_count.insert(0, z)

            for zone in range(count_rng):  # loop through all 16 possible movement
                if (TMC_count[0][3] == self.zone_def[i]) or (TMC_count[0][3] == self.zone_def[i + 1]):
                    if (TMC_count[0][1] != TMC_count[-1][1]) and (TMC_count[0][2] != TMC_count[-1][2]):  # Check if there is only 1 zone detection
                        if i == 52 or i == 56:
                            movement = [0]*3
                        for move in movement:  # loop through each 4 sub movements
                            if (TMC_count[-1][3] == self.zone_def[i + 2]) or (TMC_count[-1][3] == self.zone_def[i + 3]):
                                # TOTAL COUNT
                                self.Count[0][j] += 1  # COUNT THE MOVEMENT (THIS IS THE VARIFIED DATA THAT WILL BE USED TO TRAIN THE CNN LATER ON

                                if TMC_count[-1][4] == 0:  # Number of Cars
                                    self.Count[1][j] += 1
                                if TMC_count[-1][4] == 1:  # Number of Trucks
                                    self.Count[2][j] += 1
                                if TMC_count[-1][4] == 2:  # Number of School Buses
                                    self.Count[3][j] += 1
                                if TMC_count[-1][4] == 5:  # Number of Motorcycles/Bicycles
                                    self.Count[4][j] += 1

                                #TODO: Determine the active leg - ie. which direction(s) has the green. If direction
                                #   does not have the green, then any right turns will be classified as RTOR.
                                #   1, 2, 3, 4 = NB, SB, EB, WB = index(1, 5, 9, 13)
                                #self.active_leg =
                                # TODO: Save this ID to plot on a graph and to use in the data-matching algorithm
                                if j <= 3:
                                    clr = plt_colors[0]
                                elif (j <= 7) and (j > 3):
                                    clr = plt_colors[1]
                                elif (j <= 11) and (j > 7):
                                    clr = plt_colors[2]
                                else:
                                    clr = plt_colors[3]

                                #self.NN_data_XY_train, self.NN_data_class_train, self.NN_data_XY_test,\
                                #    = make_plot(self.processed_raw_data, TMC_count[0][0], clr=clr, alpha = 0.2, j=j)

                                # if found break out of both for loops
                                break_out = True
                                break
                            else:
                                # TODO : ***if for some reason the second detection was not defined this will
                                #    throw an error since i keeps incrementing*** Turn the second else into a method
                                #   called def misssed() - handle this error and the next with this method
                                break_out = True
                            i += 4
                            j += 1
                    else:
                        MatchFound = False

                        if TMC_count[-1][0] in self.ids_last_frame:
                            self.CarryOverDetections.append(TMC_count[0])  # Shouldn't be more than one detection in list
                            break
                        else:
                            if TMC_count[0][0] in self.ids_delete_2:  # if the id is in the potential ids to delete list
                                if TMC_count[0][0] not in buildList:  # Save each unique ID
                                    for ii in buildList:
                                        for iii in self.ids_delete:
                                            if ii in iii and TMC_count[0][0] in iii:
                                                z1 = self.buildZoneList[buildList.index(ii)][0][3]
                                                z2 = TMC_count[-1][3]
                                                MatchFound = True
                                    buildList.append(TMC_count[0][0])
                                    self.buildZoneList.append(TMC_count)
                                else:
                                    pass
                                if MatchFound:
                                    #print(z1, z2)
                                    # TODO: Save this ID to plot on a graph and to use in the data-matching algorithm
                                    #make_plot(self.processed_raw_data, TMC_count[0][0])

                                    self.Count = classify(self.Count, count_rng, z1, z2, self.zone_def, TMC_count)
                                    break
                                else:
                                    #print("missed in List" + str(TMC_count))
                                    break
                            else:
                                # TODO: Save this ID to plot on a graph and to use in the data-matching algorithm
                                #make_plot(self.processed_raw_data, TMC_count[0][0])

                                self.missed_Count = missed_Ray_method(self.processed_raw_data, self.zone_def,
                                                                     TMC_count[0][0], self.Count)
                                break

                if break_out:
                    break
                i += 4
                j += 1
        #plt.show()
        # SAVE THE DATA FOR USE LATER ON
        #ax = plt.gca()
        #ax.invert_yaxis()
        #plt.savefig('Output_graph.jpg')
        # TODO: try using a CNN to classify the misses
        #np.reshape(self.NN_data_XY_train, (720, 1280, 2))
        # with open("CNN_XY_train_{}.pkl".format(self.interval), "wb") as file:
        #     pickle.dump(self.NN_data_XY_train, file)
        # with open("CNN_class_train_{}.pkl".format(self.interval), "wb") as file:
        #     pickle.dump(self.NN_data_class_train, file)
        # with open("CNN_XY_test_{}.pkl".format(self.interval), "wb") as file:
        #     pickle.dump(self.NN_data_XY_test, file)
        # with open("CNN_class_test_{}.pkl".format(self.interval), "wb") as file:
        #     pickle.dump(self.NN_data_class_test, file)

        self.Missed = self.num_values - sum(self.Count[0])

        make_markdown_table(self.start_time, self.Count, self.project, self.name)


def make_plot(processed_raw_data, TMC_count, clr='k', alpha=1, NN_data_XY_train=[], NN_data_class_train=[],
              NN_data_XY_test=[], j=None):
    break_loop = False
    Index = 0
    # NN_data_flatten = [0] * 921600
    #NN_data = [[[0, 0] for j in range(1280)] for i in range(720)]  # Create a list that is (720 x 1280 x 2)
    #NN_data = np.array(NN_data)
    # print(np.shape(NN_data))
    NN_data_flatten = [[0, 0]] * 921600  # (921600, 2)
    #NN_data_flatten = [0] * 921600  # (921600,1)
    NN_data_class_flat = [0] * 16

    for ii in processed_raw_data:
        # print(ii)
        for k in ii:
            if k[0] == TMC_count:
                break_loop = True
                break
        Index += 1
        if break_loop:
            break

    #x_y = processed_raw_data[Index - 1]
    #NN_data.append([x_y, j])  # [id x y 0-15]

    x = []
    y = []
    int_1 = []
    int_2 = []
    for ii in processed_raw_data[Index - 1]:
        x.append(ii[1])
        y.append(ii[2])
        int_1.append(ii[3])
        int_2.append(ii[4])
        inter = [int_1, int_2]
        one_hot = ii[1] * ii[2]
        #NN_data_flatten[one_hot] = 1
        NN_data_flatten[one_hot] = [ii[3], ii[4]]
        # if ii[1] >= 1280:
        #     x = 1279
        # else:
        #     x = ii[1]
        # if ii[2] >= 720:
        #     y = 719
        # else:
        #     y = ii[2]

        #print(y, x)
        # NN_data[y][x] = [ii[3], ii[4]]

    if j:  # if a detection was made
        NN_data_class_flat[j] = 1
        NN_data_class_train.append(NN_data_class_flat)
        NN_data_XY_train.append(NN_data_flatten)
    else:
        NN_data_XY_test.append(NN_data_flatten)
    # NN_data_XY_train = np.array(NN_data_XY_train)

    # plt.scatter(x, y, color=clr, alpha=alpha)

    return NN_data_XY_train, NN_data_class_train, NN_data_XY_test


class Preprocessing:
    def __init__(self, pro_raw_data, data_zones, frame_data):
        self.frame_data = frame_data

        processed_output, self.num_values = organize_list(data_zones)
        processed_static = remove_static_detections(processed_output)

        self.processed_static_raw_data = remove_static_detections(pro_raw_data)
        self.pot_ids_delete, self.pot_ids_delete_2, self.ids_last_frame = id_change_frame(self.frame_data)
        self.processed_zone_detections = remove_bad_detections(processed_static)


def organize_list(data):
    z = []

    # list of IDs
    for zone in data:
        z.append(zone[0])

    num_values = len(np.unique(np.array(z)))

    splits = []
    split = []
    i = 0
    for zone in data:
        val = z[i]
        i += 1
        if val not in split:
            count = z.count(val)
            splits.append(count)
            split.append(z[i - 1])

    # split the zone list
    input = iter(data)
    output = [list(islice(input, elem)) for elem in splits]  # islice(iterable, start, stop, step)
    return output, num_values


def remove_static_detections(processed_output):
        p2 = []
        j = 0
        for id in processed_output:  # For each unique id
            i = 0
            k = 0
            for point in range(len(id)):
                while i < len(id) - 1:
                    if k == 0:  # this should only run once
                        p2 = [id[i][1], id[i][2]]
                        k += 1
                    else:
                        i += 1
                        p1 = [id[i][1], id[i][2]]
                        # distance = math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)
                        sq_distance = ((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)
                        if sq_distance < 40:
                            removed_element = processed_output[j].pop(i)
                            # print(removed_element, distance)
                            i -= 1
                            if len(processed_output[j]) == 0:  # if the list is empty
                                processed_output[j].pop()
                        else:
                            if i < len(id) - 1:  # chek we arnt at the end of the list or get index error
                                # i += 1
                                p2 = [id[k][1], id[k][2]]
                                k += 1
                            else:
                                break
            j += 1
        return processed_output


def id_change_frame(frame_data):
        pot_ids_delete = []
        pot_ids_delete_2 = []
        ids_last_frame = []
        last_frame = frame_data[-1][-1][3]

        frame_data = frame_data[1:]  # remove the first blank element
        for frame in frame_data:
            for i in range(len(frame)):
                for j in range(len(frame)):
                    # create list o fids in the last frame
                    if frame[j][3] == last_frame and frame[j][0] not in ids_last_frame:
                        ids_last_frame.append(frame[j][0])
                    # create a list of ids that could of possibly been reused
                    if i != j:
                        p1 = [frame[i][1], frame[i][2]]
                        p2 = [frame[j][1], frame[j][2]]
                        sq_distance = ((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2)
                        if sq_distance < 625:
                            id = frame[i][0]
                            id_check = False
                            if id not in pot_ids_delete_2:
                                pot_ids_delete_2.append(frame[i][0])
                            for k in pot_ids_delete:
                                if id in k:
                                    id_check = True
                            if not id_check:
                                pot_ids_delete.append([frame[i][0], frame[j][0]])
        return pot_ids_delete, pot_ids_delete_2, ids_last_frame


def remove_bad_detections(processed_static):
    j = 0
    new_processed_static = []
    for id in processed_static:  # For each unique id
        i = 0
        for point in range(len(id)):
            while i < len(id) - 1:
                if i == 0:
                    p2 = id[i][3]
                    i += 1
                else:
                    if p2 != id[i][3]:
                        i += 1
                        if len(processed_static[j][i:]) > 1:  # if there are 2 detections following
                            new_processed_static.append(processed_static[j][i:])
                            processed_static[j] = processed_static[j][:i]
                            break
                        # TODO : remove the 3rd detection - this makes the count worse for now but it is correct.
                        elif len(processed_static[j][i:]) == 1:
                            #print("id to find" + str(processed_static[j]))
                            processed_static[j] = processed_static[j][:i]  # Delete the last value
                            break
                    else:
                        i += 1
                        p2 = id[i][3]
        j += 1
    for i in range(len(new_processed_static)):
        processed_static.append(new_processed_static[i])
    return processed_static


def missed_Ray_method(raw_data, zone_def, id_2_find, Count):
    count_rng = len(Count[0]) - 3
    ZoneList = []

    for TMC_count in raw_data:  # For each unique id
        if int(id_2_find) == TMC_count[0][0]:
            zoneFound = False
            z1 = None
            z1_x = None
            z2 = None
            z1_ave = []
            count = 0
            foundOutside = False
            # First check that the detection started outside the zone box: ie. there are 2 non zero values
            for i in range(len(TMC_count)):
                if TMC_count[i][3] != 0 and TMC_count[i][4] != 0:
                    z1_ave.append(TMC_count[i][3])

                    foundOutside = True

            if z1_ave:
                z1_ave = Counter(z1_ave)
                z1_ave = z1_ave.most_common(1)[0][0]
                #print(TMC_count[0][0], z1_ave)

            if foundOutside:
                while count < len(TMC_count):  # loop through each detection in unique id
                    if TMC_count[count][3] != 0 and TMC_count[count][4] != 0 and not zoneFound:
                        #z1 = TMC_count[count][3]  # save the first non-zero zone detection as z1
                        #z1_x = TMC_count[count][3]
                        z1 = z1_ave
                        z1_x = z1_ave
                        count += 1
                        zoneFound = True
                    elif TMC_count[count][3] != 0 and zoneFound:
                        if z1_x == TMC_count[count][3]:  # CHECK AGAINST Z1_X IN ORDER TO GET THE LAST CHANGE IN THE LIST
                            count += 1
                        else:
                            z1_x = TMC_count[count][3]
                            z2 = TMC_count[count][3]
                            count += 1
                    else:
                        count += 1
            if z1 != None and z2 == None:  # Check if possible U turn
                pass

            ZoneList.append([TMC_count[0][0], z1, z2])
            #print(ZoneList)
            Count = classify(Count, count_rng, z1, z2, zone_def, TMC_count)
        else:
            pass
    return Count


def NN(pro_data, midpoint_line):
    distance_list = []
    for data in pro_data:
        distance = math.sqrt((data[1] - midpoint_line[0]) ** 2 + (data[2] - midpoint_line[1]) ** 2)
        distance_list.append(distance)
    idx = distance_list.index(min(distance_list))
    midpoint_data = [pro_data[idx][1], pro_data[idx][2]]

    return midpoint_data


def classify(Count, count_rng, EnterZone, ExitZone, zone_def, TMC_count):
    # classify the movement
    k = 0
    l = 0
    movement = [0] * 4
    sub_break_out = False
    for rng in range(count_rng):  # loop through all 16 possible movement
        if (EnterZone == zone_def[l]) or (EnterZone == zone_def[l + 1]):
            # TODO: CHECK THIS!!!
            if l == 52 or l == 56:
                movement = [0] * 3
            for move in movement:  # loop through each 4 sub movements
                if (ExitZone == zone_def[l + 2]) or (ExitZone == zone_def[l + 3]):
                    Count[0][k] += 1
                    if TMC_count[-1][4] == 0:  # Number of Cars
                        Count[1][k] += 1
                    if TMC_count[-1][4] == 1:  # Number of Trucks
                        Count[2][k] += 1
                    if TMC_count[-1][4] == 2:  # Number of School Buses
                        Count[3][k] += 1
                    if TMC_count[-1][4] == 5:  # Number of Motorcycles/Bicycles
                        Count[4][k] += 1

                    if k == 14:
                        print("id to find =" + str(TMC_count[0][0]))
                    # if found break out of both for loops
                    sub_break_out = True
                    break
                else:
                    # TODO : ***if for some reason the second detection was not defined this will
                    #    throw an error since l keeps incrementing*** Turn the second else into a function
                    #   called def misssed() - handle this error and the next with this function
                    sub_break_out = True
                l += 4
                k += 1
        if sub_break_out:
            break
        l += 4
        k += 1
    return Count


def make_markdown_table(start_time, Count, project, name):
    v_counts = ['TOTAL', 'CAR', 'TRUCK', 'BUS', 'BI']
    v_count = 0
    for v_cls in Count:
        with open("./{}/{}/Output_{}.txt".format(project, name, v_counts[v_count]), "r") as Output:
            markdown_list = Output.readlines()

        with open('./{}/{}/Output_{}.txt'.format(project, name, v_counts[v_count]), 'w') as file:
            for num in markdown_list:
                file.write(str(num))
            file.write("\n")
            file.write("|   " + str(start_time) + "   |")

            for num in v_cls:  # check if value is 1 2 or 3 digits
                if len(str(num)) == 1:
                    file.write(" " + str(num) + " |")
                if len(str(num)) == 2:
                    file.write(str(num) + " |")
                if len(str(num)) == 3:
                    file.write(str(num) + "|")
        file.close()
        v_count += 1
