import json
import spotify_commands
import math


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


def time_digit_to_min_sec(duration):
    duration = duration * 60  # getting total seconds bc formatted in minutes
    minutes = int(math.floor(duration / 60))
    seconds = int(round(duration % 60, 0))
    duration_string = str(minutes) + ":" + str(seconds)
    return duration_string


def display_stats(playlist='dynamic'):
    with open('stats.json') as f:
        data = json.load(f)

    playlist_results_string = f'__***Audio features for the {playlist} playlist***__\n'
    playlist_results_string += "```fix\n"

    # looking at avg attributes first
    metadata = data['playlists'][playlist]['meta']['avg_features']
    song_duration = time_digit_to_min_sec(metadata['song_length'])
    playlist_results_string += f'Average length: {song_duration}\n'

    avg_tempo = round(metadata['tempo'], 1)
    playlist_results_string += f'Average tempo in BPM: {avg_tempo}\n'

    avg_dance = round(metadata['danceability'], 3)
    playlist_results_string += f'Average danceability: {avg_dance}\n'

    avg_energy = round(metadata['energy'], 3)
    playlist_results_string += f'Average energy: {avg_energy}\n'

    avg_loudness = round(metadata['energy'], 3)
    playlist_results_string += f'Average loudness: {avg_loudness}\n'

    avg_valence = round(metadata['valence'], 3)
    playlist_results_string += f'Average valence: {avg_valence}\n'
    playlist_results_string += f'\n'
    playlist_results_string += f'See https://bit.ly/3d9Z9bm for more info on Spotify track attributes\n'
    playlist_results_string += '```'

    playlist_results_string += f'\n'

    # looking at user counts
    metadata = data['playlists'][playlist]
    playlist_results_string += f'__***User participation in the {playlist} playlist***__\n'
    playlist_results_string += "```fix\n"

    users = {}
    for track, values in metadata['tracks'].items():
        if values['added_by'] not in users:
            users[values['added_by']] = 1
        else:
            users[values['added_by']] += 1

    users = {key: value for key, value in sorted(users.items(), key=lambda item: item[1], reverse=True)}
    counter = 1
    for user, track_add in users.items():
        playlist_results_string += f'{counter}. {user}: {track_add} tracks added\n'
        counter += 1

    playlist_results_string += '```'
    return playlist_results_string


def display_hiscores():
    pass


if __name__ == "__main__":
    print(display_stats())
