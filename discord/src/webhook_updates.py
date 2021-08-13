import os
from dotenv import load_dotenv
from .db import DatabaseConnection, access_secret_version
from .config import environment
from discord_webhook import DiscordWebhook, DiscordEmbed
from datetime import datetime, timedelta

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if environment == "dev":
    load_dotenv(f'{base_dir}/dev.env')
    webhook_url = os.getenv('UPDATES_WEBHOOK')
elif environment == "prod":
    project_id = os.getenv("PROJECT_ID")
    webhook_url = access_secret_version(secret_id='vb-updates-webhook',
                                        project_id=project_id)


def get_daily_stats() -> dict:
    playlist_data = {}
    conn = DatabaseConnection()

    # pull number of tracks in dynamic
    num_tracks = conn.select_query(query_literal="COUNT(*)", table="dynamic")
    playlist_data['num_tracks'] = num_tracks[0][0]

    # pull number of tracks added in the last day
    current_date = datetime.utcnow()
    start_of_day = current_date - timedelta(days=1)
    date_format = "%Y-%m-%d %H:%M:%S"

    tracks_added_sql = f"""SELECT COUNT(*) FROM dynamic WHERE added_at BETWEEN '{start_of_day.strftime(date_format)}'
    AND '{current_date.strftime(date_format)}';"""
    tracks_added = conn.select_query_raw(sql=tracks_added_sql)
    playlist_data['tracks_added_today'] = tracks_added[0][0]

    # pull number of tracks soon-to-expire tracks
    expiration_date = current_date - timedelta(days=13)
    expiration_date = expiration_date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_before_expiration = expiration_date + timedelta(days=1)
    tracks_to_remove_sql = f"""SELECT COUNT(*) FROM dynamic WHERE added_at BETWEEN 
    '{expiration_date.strftime(date_format)}' AND '{day_before_expiration.strftime(date_format)}';"""
    tracks_to_remove = conn.select_query_raw(sql=tracks_to_remove_sql)
    playlist_data['tracks_to_remove'] = tracks_to_remove[0][0]

    # pull novel tracks
    novel_tracks_sql = f"""WITH songs_added_today AS (
    SELECT songs.name AS name, songs.id AS id FROM songs JOIN archive ON archive.song_id = songs.id
    WHERE archive.added_at BETWEEN '{start_of_day.strftime(date_format)}' AND '{current_date.strftime(date_format)}')
    SELECT songs_added_today.name, songs_added_today.id FROM songs_added_today JOIN archive
    ON songs_added_today.id = archive.song_id GROUP BY songs_added_today.name, songs_added_today.id
    HAVING COUNT(archive.song_id) = 1;"""
    novel_tracks = conn.select_query_raw(sql=novel_tracks_sql)
    playlist_data['novel_tracks_added'] = len(novel_tracks)

    # pull genres and isolate novel ones
    genres_added_today_sql = f"""SELECT DISTINCT artists_genres.genre AS genre FROM artists_genres JOIN archive
    ON archive.artist_id = artists_genres.artist_id WHERE archive.added_at BETWEEN 
    '{start_of_day.strftime(date_format)}' AND '{current_date.strftime(date_format)}';"""
    genres_added_today = conn.select_query_raw(sql=genres_added_today_sql)
    genres_added_today = [x[0] for x in genres_added_today]

    genres_before_today_sql = f"""SELECT DISTINCT artists_genres.genre FROM artists_genres JOIN archive
    ON archive.artist_id = artists_genres.artist_id WHERE archive.added_at < '{start_of_day.strftime(date_format)}';"""
    genres_before_today = conn.select_query_raw(sql=genres_before_today_sql)
    genres_before_today = [x[0] for x in genres_before_today]

    novel_genres = []
    for genre in genres_added_today:
        if genre not in genres_before_today:
            novel_genres.append(genre)
    playlist_data['novel_genres'] = ''.join(str(e) + ', ' for e in novel_genres)

    # pull artists and isolate novel ones
    artists_added_today_sql = f"""SELECT DISTINCT artists.name AS name FROM artists JOIN archive ON 
    archive.artist_id = artists.id WHERE archive.added_at BETWEEN '{start_of_day.strftime(date_format)}' 
    AND '{current_date.strftime(date_format)}';"""
    artists_added_today = conn.select_query_raw(sql=artists_added_today_sql)
    artists_added_today = [x[0] for x in artists_added_today]

    artists_before_today_sql = f"""SELECT DISTINCT artists.name AS name FROM artists JOIN archive
    ON archive.artist_id = artists.id WHERE archive.added_at < '{start_of_day.strftime(date_format)}';"""
    artists_before_today = conn.select_query_raw(sql=artists_before_today_sql)
    artists_before_today = [x[0] for x in artists_before_today]

    novel_artists = []
    for artist in artists_added_today:
        if artist not in artists_before_today:
            novel_artists.append(artist)
    playlist_data['novel_artists'] = ''.join(str(e) + ', ' for e in novel_artists)

    conn.terminate()
    return playlist_data


def post_webhook():
    playlist_data = get_daily_stats()

    embed = DiscordEmbed(title='VaultBot Daily Stat Overview',
                         color='BCE7FD')
    embed.set_timestamp()

    embed.add_embed_field(
        name='Total number of tracks',
        value=playlist_data['num_tracks'],
        inline=False
    )
    embed.add_embed_field(
        name='Tracks added today',
        value=playlist_data['tracks_added_today'],
        inline=False
    )
    embed.add_embed_field(
        name='Tracks to be purged',
        value=playlist_data['tracks_to_remove'],
        inline=False
    )
    if playlist_data['novel_genres']:
        embed.add_embed_field(
            name='New genres',
            value=playlist_data['novel_genres'],
            inline=False
        )
    if playlist_data['novel_artists']:
        embed.add_embed_field(
            name='New artists',
            value=playlist_data['novel_artists'],
            inline=False
        )

    webhook = DiscordWebhook(url=webhook_url)
    webhook.add_embed(embed)
    webhook.execute()


if __name__ == '__main__':
    post_webhook()
