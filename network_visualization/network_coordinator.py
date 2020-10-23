import network_analysis
import os
import pandas as pd
import network_db
# import from main directory
# https://stackoverflow.com/questions/22955684/how-to-import-py-file-from-another-directory


def refresh_network_tables():
    path = os.getcwd()
    # save original file path - really only need this for saving arts, which this module is not doing right now

    song_analysis_data = pd.read_csv(r"../genre_output.csv")
    # TODO: adapt the genre output from genre_output.csv to work with network edge data

    network_db.clear_network_tables()
    # nodes and edges tables should be cleared prior to these functions so fresh genre_output.csv data can be inserted
    network_edge_data = network_analysis.generate_network_edges(song_analysis_data)
    network_node_data = network_analysis.generate_network_nodes(song_analysis_data, network_edge_data)


if __name__ == "__main__":
    pass
