import json
import spotify_commands
import math
import pandas as pd


#######################################################################################################################
# this script mostly dealt with managing the data in the form of JSON, but has since been depreciated since the project
# now uses a PostgreSQL database for managing playlist data. furthermore, the stats and highscores functions
# have been replaced by the interactive_table.R being a webpage output that is much more user-friendly.
#######################################################################################################################

# only used once to establish a JSON file from which we can add to
def generate_json(song_id, user):  # only run once to generate the json for use with other functions
    fixed_song_id = spotify_commands.convert_to_track_id(song_id)
    test_track = spotify_commands.get_track_info(track_id=fixed_song_id, user=user)

    dynamic = {"meta": {}, 'tracks': {}}
    archive = {"meta": {}, 'tracks': {}}

    playlists = {"dynamic": dynamic, "archive": archive}
    users = {"meta": {}, "user_list": {}}

    playlists["dynamic"]["tracks"][fixed_song_id] = test_track
    playlists["archive"]["tracks"][fixed_song_id] = test_track

    users["user_list"][user] = {}
    users["user_list"][user]["total_tracks_added"] = {}
    users["user_list"][user]["total_tracks_added"][song_id] = test_track
    users["user_list"][user]["avg_features"] = {}

    playlists["dynamic"]["meta"]["avg_features"] = {}  # init avg features for later
    playlists["archive"]["meta"]["avg_features"] = {}

    playlists["dynamic"]["meta"]["count"] = len(playlists["dynamic"]["tracks"])
    playlists["archive"]["meta"]["count"] = len(playlists["archive"]["tracks"])
    users["meta"]["count"] = len(users["user_list"])
    users["user_list"][user]['song_count'] = len(users["user_list"][user]["total_tracks_added"])
    overall_dict = {"playlists": playlists, "users": users}

    with open('stats.json', 'w') as f:
        json.dump(overall_dict, f, indent=2)


# depreciated
def stats_song_add(song_id, user):
    with open('stats.json') as f:
        data = json.load(f)

    song_dict = spotify_commands.get_track_info(track_id=song_id, user=user)

    data['playlists']['dynamic']['tracks'][song_id] = song_dict
    data['playlists']['archive']['tracks'][song_id] = song_dict

    if user in data['users']['user_list']:  # if user exists, append dict to existing info
        data['users']['user_list'][user]['total_tracks_added'][song_id] = song_dict

    else:  # else, create new listing for user and append dict
        data['users']['user_list'][user] = {}
        data['users']['user_list'][user]['total_tracks_added'] = {}
        data['users']['user_list'][user]['total_tracks_added'][song_id] = song_dict
        data['users']['user_list'][user]['avg_features'] = {}  # init avg features for later

    # update meta counts
    data['playlists']['dynamic']['meta']['count'] = len(data['playlists']['dynamic']['tracks'])
    data['playlists']['archive']['meta']['count'] = len(data['playlists']['archive']['tracks'])
    data['users']['meta']['count'] = len(data['users']['user_list'])
    data['users']['user_list'][user]['song_count'] = len(data['users']['user_list'][user]['total_tracks_added'])

    # update average attributes
    data['playlists']['dynamic']['meta']['avg_features'] = average_features(
        features_dict=data['playlists']['dynamic']['tracks'])
    data['playlists']['archive']['meta']['avg_features'] = average_features(
        features_dict=data['playlists']['archive']['tracks'])
    for user, value in data['users']['user_list'].items():
        value['avg_features'] = average_features(features_dict=value['total_tracks_added'])

    with open('stats.json', 'w') as f:
        json.dump(data, f, indent=2)


# depreciated
def purge_stats(song_id):
    with open('stats.json') as f:
        data = json.load(f)

    del data['playlists']['dynamic']['tracks'][song_id]
    print(f'Deleted track "{song_id}" in dynamic playlist data')

    with open('stats.json', 'w') as f:
        json.dump(data, f, indent=2)


# depreciated
def average_features(features_dict):
    """

    :return:
    :param features_dict: Dictionary of dictionaries containing Spotify song features
    """

    def list_avg(feature_sum_list):
        item_sum = 0
        for item in feature_sum_list:
            item_sum += item
        return item_sum / len(feature_sum_list)

    song_lengths = []
    tempos = []
    dances = []
    energies = []
    loudnesses = []
    acoustics = []
    instruments = []
    livenesses = []
    valences = []

    for track_id, track_dict in features_dict.items():
        song_lengths.append(track_dict["song_length"])
        tempos.append(track_dict["tempo"])
        dances.append(track_dict["danceability"])
        energies.append(track_dict["energy"])
        loudnesses.append(track_dict["loudness"])
        acoustics.append(track_dict["acousticness"])
        instruments.append(track_dict["instrumentalness"])
        livenesses.append(track_dict["liveness"])
        valences.append(track_dict["valence"])

    song_length_avg = list_avg(song_lengths)
    tempo_avg = list_avg(tempos)
    dance_avg = list_avg(dances)
    energy_avg = list_avg(energies)
    loudness_avg = list_avg(loudnesses)
    acoustics_avg = list_avg(acoustics)
    instruments_avg = list_avg(instruments)
    liveness_avg = list_avg(livenesses)
    valence_avg = list_avg(valences)

    avg_dict = {'song_length': song_length_avg, 'tempo': tempo_avg, 'danceability': dance_avg,
                'energy': energy_avg, 'loudness': loudness_avg, 'acousticness': acoustics_avg,
                'instrumentalness': instruments_avg, 'liveness': liveness_avg, 'valence': valence_avg}
    return avg_dict


def time_digit_to_min_sec(duration):
    duration = duration * 60  # getting total seconds bc formatted in minutes
    minutes = int(math.floor(duration / 60))
    seconds = int(round(duration % 60, 0))
    duration_string = str(minutes) + ":" + str(seconds)
    return duration_string




# never used
def valid_user_list():
    with open('stats.json') as f:
        data = json.load(f)
    users = data['users']['user_list'].keys()
    return users


if __name__ == "__main__":
    pass
