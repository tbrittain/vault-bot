from db import DatabaseConnection

# There was an issue that caused some of the historical tracking data to become mixed up
# The problem needs to be remedied in the following way:
# Data for each row from source column -> target column
# energy -> popularity -> length -> energy
# tempo -> valence -> danceability -> tempo
# This occurred from the following dates: 2021-06-17 03:58:00 (i.e. when I originally
# refactored the historical_tracking code) to 08-13-2021 18:00:00


def hist_track_fix():
    conn = DatabaseConnection()

    get_jumbled_data_sql = """SELECT * FROM historical_tracking WHERE updated_at > '2021-06-17';"""
    jumbled_data = conn.select_query_raw(sql=get_jumbled_data_sql)

    # the actual column order returned from the query are as follows:
    # updated_at | pdi | popularity | danceability | energy | valence | song_length | tempo | novelty | id
    # pdi and novelty are correct, but the rest require fixing
    updated_row_count = 0
    for row in jumbled_data:
        updated_at, pdi, o_pop, o_dance, o_energy, o_valence, o_length, o_tempo, novelty, o_id_pkey = row

        # correct variables
        new_energy = o_length
        new_pop = o_energy
        new_length = o_pop

        new_tempo = o_dance
        new_valence = o_tempo
        new_dance = o_valence

        # update corresponding row in table
        update_sql = f"""UPDATE historical_tracking SET popularity = {new_pop}, danceability = {new_dance},
                    energy = {new_energy}, valence = {new_valence}, song_length = {new_length}, tempo = {new_tempo}
                    WHERE updated_at = '{updated_at}';"""
        update_response = conn.update_query_raw(sql=update_sql)
        if update_response:
            updated_row_count += 1

    print(f"Number of rows updated: {updated_row_count}")
    conn.commit()
    conn.terminate()


if __name__ == "__main__":
    hist_track_fix()
