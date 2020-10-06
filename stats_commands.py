import json
import spotify_commands


# after writing to the stats.json file in the proper format, be sure to add
# with open('stats.json') as f
# data = json.load(f)

# writing to json:
# with open('stats.json', 'w') as f:
# json.dump(data, f, indent=2)

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

    # TODO: make stats update when $stats called as well, not just when song is added
    # update average attributes
    data['playlists']['dynamic']['meta']['avg_features'] = average_features(
        features_dict=data['playlists']['dynamic']['tracks'])
    data['playlists']['archive']['meta']['avg_features'] = average_features(
        features_dict=data['playlists']['archive']['tracks'])
    for user, value in data['users']['user_list'].items():
        value['avg_features'] = average_features(features_dict=value['total_tracks_added'])

    with open('stats.json', 'w') as f:
        json.dump(data, f, indent=2)


def purge_stats(song_id):
    with open('stats.json') as f:
        data = json.load(f)

    del data['playlists']['dynamic']['tracks'][song_id]
    print(f'Deleted track "{song_id}" in dynamic playlist data')

    with open('stats.json', 'w') as f:
        json.dump(data, f, indent=2)


def average_features(features_dict):
    """

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


def display_stats():
    pass


def display_hiscores():
    pass


if __name__ == "__main__":
    # generate_json(song_id='5qNNanYonpCwahfJGuFVRQ', user='threesquared#3899')
    # stats_song_add(song_id='7pBrj5rt4SSxXwFKOyZfHR', user='threesquared#3899')
    # stats_song_add(song_id='3DYZKxjG8SZrWpVcoUilqQ', user='threesquared#3899')
    # stats_song_add(song_id='0bQsNfzUMg134oWkAclfeK', user='threesquared#3899')
    # stats_song_add(song_id='1bq6eYt2tdB5rSkwXgiwgD', user='threesquared#3899')
    # stats_song_add(song_id='2PBcNVg8jB1e5kVkjXJyZ5', user='threesquared#3899')
    # stats_song_add(song_id='2oeqKWbVwK5Ly2vjwWJKHd', user='threesquared#3899')
    # stats_song_add(song_id='4V3N5LvUOh3yDPP16cwAhE', user='threesquared#3899')
    # stats_song_add(song_id='1Pf5Ab6WhHBnSmw2EL5asT', user='threesquared#3899')
    # stats_song_add(song_id='3bEvzQYZFSvlP2eUe4lPeu', user='threesquared#3899')
    # stats_song_add(song_id='0PWsvwAT2AR6HBHb9kgvEI', user='threesquared#3899')
    # stats_song_add(song_id='33OgftlouizHnppeukWtrk', user='threesquared#3899')
    # stats_song_add(song_id='65u7IbuZ4viAlVBHxnpos1', user='threesquared#3899')
    # stats_song_add(song_id='1aRvUHgMe9ichgcHAAs12f', user='Schmene#1026')
    pass
