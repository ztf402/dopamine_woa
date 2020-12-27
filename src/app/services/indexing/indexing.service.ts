import { Injectable } from '@angular/core';
import { Logger } from '../../core/logger';
import { BaseTrackRepository } from '../../data/repositories/base-track-repository';
import { BaseFolderService } from '../folder/base-folder.service';
import { AlbumArtworkIndexer } from './album-artwork-indexer';
import { BaseCollectionChecker } from './base-collection-checker';
import { BaseIndexingService } from './base-indexing.service';
import { TrackIndexer } from './track-indexer';

@Injectable({
  providedIn: 'root'
})
export class IndexingService implements BaseIndexingService {
  constructor(
    private collectionChecker: BaseCollectionChecker,
    private trackIndexer: TrackIndexer,
    private albumArtworkIndexer: AlbumArtworkIndexer,
    private trackRepository: BaseTrackRepository,
    private folderService: BaseFolderService,
    private logger: Logger
  ) { }

  public isIndexingCollection: boolean = false;

  public async indexCollectionIfOutdatedAsync(): Promise<void> {
    if (this.isIndexingCollection) {
      this.logger.info('Already indexing.', 'IndexingService', 'indexCollectionIfOutdatedAsync');

      return;
    }

    this.isIndexingCollection = true;

    this.logger.info('Indexing collection.', 'IndexingService', 'indexCollectionIfOutdatedAsync');

    const collectionIsOutdated: boolean = await this.collectionChecker.isCollectionOutdatedAsync();

    if (collectionIsOutdated) {
      this.logger.info('Collection is outdated.', 'IndexingService', 'indexCollectionIfOutdatedAsync');
      await this.trackIndexer.indexTracksAsync();
    } else {
      this.logger.info('Collection is not outdated.', 'IndexingService', 'indexCollectionIfOutdatedAsync');
    }

    await this.albumArtworkIndexer.indexAlbumArtworkAsync();

    this.isIndexingCollection = false;
  }

  public async indexCollectionIfFoldersHaveChangedAsync(): Promise<void> {
    if (!this.folderService.haveFoldersChanged()) {
      this.logger.info('Folders have not changed.', 'IndexingService', 'indexCollectionIfFoldersHaveChangedAsync');

      return;
    }

    this.logger.info('Folders have changed.', 'IndexingService', 'indexCollectionIfFoldersHaveChangedAsync');

    if (this.isIndexingCollection) {
      this.logger.info('Already indexing.', 'IndexingService', 'indexCollectionIfFoldersHaveChangedAsync');

      return;
    }

    this.isIndexingCollection = true;

    this.logger.info('Indexing collection.', 'IndexingService', 'indexCollectionIfFoldersHaveChangedAsync');

    this.folderService.resetFolderChanges();

    await this.trackIndexer.indexTracksAsync();
    await this.albumArtworkIndexer.indexAlbumArtworkAsync();

    this.isIndexingCollection = false;
  }

  public async indexCollectionAlwaysAsync(): Promise<void> {
    if (this.isIndexingCollection) {
      this.logger.info('Already indexing.', 'IndexingService', 'indexCollectionAlwaysAsync');

      return;
    }

    this.isIndexingCollection = true;

    this.logger.info('Indexing collection.', 'IndexingService', 'indexCollectionAlwaysAsync');

    await this.trackIndexer.indexTracksAsync();
    await this.albumArtworkIndexer.indexAlbumArtworkAsync();

    this.isIndexingCollection = false;
  }

  public async indexAlbumArtworkOnlyAsync(onlyWhenHasNoCover: boolean): Promise<void> {
    if (this.isIndexingCollection) {
      this.logger.info('Already indexing.', 'IndexingService', 'indexAlbumArtworkOnlyAsync');

      return;
    }

    this.isIndexingCollection = true;

    this.logger.info('Indexing collection.', 'IndexingService', 'indexAlbumArtworkOnlyAsync');

    this.trackRepository.enableNeedsAlbumArtworkIndexingForAllTracks(onlyWhenHasNoCover);
    await this.albumArtworkIndexer.indexAlbumArtworkAsync();

    this.isIndexingCollection = false;
  }
}
